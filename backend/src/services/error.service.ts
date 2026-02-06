/**
 * Error Service - MongoDB integration for error persistence
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

// Types
export interface ErrorDocument {
  _id?: ObjectId;
  id: string;
  message: string;
  stack: string;
  file: string;
  line: number;
  column?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved';
  affectedUsers: number;
  sessions: number;
  environment: string;
  browser?: string;
  os?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  // Fingerprinting & deduplication fields
  fingerprint?: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  projectId?: string;
  url?: string;
}

export interface ErrorFilters {
  severity?: string;
  status?: string;
  file?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface TimelineDataPoint {
  time: string;
  count: number;
  timestamp: string;
}

export interface DeploymentMarker {
  time: string;
  version: string;
  timestamp: string;
}

class ErrorService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private errors: Collection<ErrorDocument> | null = null;
  private deployments: Collection<DeploymentMarker> | null = null;
  private inMemoryErrors: ErrorDocument[] = [];
  private connected = false;

  async connect(): Promise<void> {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/erroriq';
    
    try {
      // Add connection options to handle SSL/TLS issues on Node.js v22+
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        // Use tlsInsecure to bypass OpenSSL compatibility issues in Node.js v22
        tlsInsecure: true,
      });
      await this.client.connect();
      this.db = this.client.db();
      this.errors = this.db.collection<ErrorDocument>('errors');
      this.deployments = this.db.collection<DeploymentMarker>('deployments');
      
      // Create indexes for efficient queries
      await this.errors.createIndex({ createdAt: -1 });
      await this.errors.createIndex({ severity: 1 });
      await this.errors.createIndex({ status: 1 });
      await this.errors.createIndex({ file: 1 });
      await this.errors.createIndex({ fingerprint: 1 }, { unique: true, sparse: true });
      
      this.connected = true;
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.warn('⚠️ MongoDB connection failed, using in-memory storage:', error);
      this.connected = false;
      this.seedMockData();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.connected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  /**
   * Generate fingerprint for error deduplication
   */
  private generateFingerprint(message: string, stack?: string): string {
    const firstStackLine = stack?.split('\n')[0] || '';
    const normalized = `${message}:${firstStackLine}`.toLowerCase().trim();
    return createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Create a new error record or update existing one (deduplication)
   */
  async createError(data: Omit<ErrorDocument, '_id' | 'id' | 'createdAt' | 'updatedAt' | 'occurrences' | 'firstSeen' | 'lastSeen'>): Promise<{ error: ErrorDocument; isNew: boolean }> {
    const fingerprint = this.generateFingerprint(data.message, data.stack);
    const now = new Date();

    if (this.connected && this.errors) {
      // Check for existing error with same fingerprint
      const existing = await this.errors.findOne({ fingerprint });
      
      if (existing) {
        // Update existing error - increment occurrences
        await this.errors.updateOne(
          { _id: existing._id },
          {
            $inc: { occurrences: 1, affectedUsers: data.affectedUsers || 1, sessions: data.sessions || 1 },
            $set: { lastSeen: now, updatedAt: now }
          }
        );
        const updated = await this.errors.findOne({ _id: existing._id });
        return { error: updated!, isNew: false };
      }
    } else {
      // In-memory: check for existing
      const existing = this.inMemoryErrors.find(e => e.fingerprint === fingerprint);
      if (existing) {
        existing.occurrences += 1;
        existing.affectedUsers += data.affectedUsers || 1;
        existing.sessions += data.sessions || 1;
        existing.lastSeen = now;
        existing.updatedAt = now;
        return { error: existing, isNew: false };
      }
    }

    // Create new error
    const error: ErrorDocument = {
      ...data,
      id: uuidv4(),
      fingerprint,
      occurrences: 1,
      firstSeen: now,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    };

    if (this.connected && this.errors) {
      await this.errors.insertOne(error);
    } else {
      this.inMemoryErrors.push(error);
    }

    return { error, isNew: true };
  }

  /**
   * Get errors with optional filters
   */
  async getErrors(filters: ErrorFilters = {}, limit = 50, skip = 0): Promise<ErrorDocument[]> {
    const query = this.buildQuery(filters);

    if (this.connected && this.errors) {
      return this.errors
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    }

    // In-memory fallback
    let results = [...this.inMemoryErrors];
    
    if (filters.severity) {
      results = results.filter(e => e.severity === filters.severity);
    }
    if (filters.status) {
      results = results.filter(e => e.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(e => 
        e.message.toLowerCase().includes(search) ||
        e.file.toLowerCase().includes(search)
      );
    }

    return results
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);
  }

  /**
   * Get a single error by ID
   */
  async getErrorById(id: string): Promise<ErrorDocument | null> {
    if (this.connected && this.errors) {
      return this.errors.findOne({ id });
    }

    return this.inMemoryErrors.find(e => e.id === id) || null;
  }

  /**
   * Get timeline data for error chart
   */
  async getTimeline(range: string): Promise<{ timeline: TimelineDataPoint[]; deployments: DeploymentMarker[] }> {
    const now = new Date();
    let startDate: Date;
    let intervalMs: number;
    let pointCount: number;

    switch (range) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        intervalMs = 5 * 60 * 1000; // 5 minutes
        pointCount = 12;
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        intervalMs = 3 * 60 * 60 * 1000; // 3 hours
        pointCount = 8;
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        pointCount = 7;
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        intervalMs = 3 * 60 * 60 * 1000;
        pointCount = 8;
    }

    // Generate timeline points
    const timeline: TimelineDataPoint[] = [];
    
    for (let i = 0; i < pointCount; i++) {
      const pointTime = new Date(startDate.getTime() + i * intervalMs);
      const nextPointTime = new Date(pointTime.getTime() + intervalMs);
      
      let count: number;
      
      if (this.connected && this.errors) {
        count = await this.errors.countDocuments({
          createdAt: { $gte: pointTime, $lt: nextPointTime }
        });
      } else {
        count = this.inMemoryErrors.filter(e => 
          e.createdAt >= pointTime && e.createdAt < nextPointTime
        ).length;
        
        // Add some variation for demo
        if (count === 0) {
          count = Math.floor(Math.random() * 80) + 10;
        }
      }

      timeline.push({
        time: this.formatTimeLabel(pointTime, range),
        count,
        timestamp: pointTime.toISOString(),
      });
    }

    // Get deployment markers
    const deployments: DeploymentMarker[] = [
      { time: '12pm', version: 'v3.2.0', timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString() },
      { time: '6pm', version: 'Config change', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() },
    ];

    return { timeline, deployments };
  }

  /**
   * Find similar errors based on message pattern
   */
  async getSimilarErrors(errorMessage: string, limit = 5): Promise<ErrorDocument[]> {
    // Simple similarity - find errors with similar keywords
    const keywords = errorMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    if (this.connected && this.errors) {
      const regex = new RegExp(keywords.join('|'), 'i');
      return this.errors
        .find({ message: { $regex: regex } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    }

    return this.inMemoryErrors
      .filter(e => keywords.some(kw => e.message.toLowerCase().includes(kw)))
      .slice(0, limit);
  }

  /**
   * Update error status
   */
  async updateErrorStatus(id: string, status: ErrorDocument['status']): Promise<ErrorDocument | null> {
    const updateData: Partial<ErrorDocument> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    if (this.connected && this.errors) {
      await this.errors.updateOne({ id }, { $set: updateData });
      return this.errors.findOne({ id });
    }

    const error = this.inMemoryErrors.find(e => e.id === id);
    if (error) {
      Object.assign(error, updateData);
    }
    return error || null;
  }

  /**
   * Get error statistics
   */
  async getStats(): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    last24h: number;
  }> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (this.connected && this.errors) {
      const [total, bySeverity, byStatus, last24h] = await Promise.all([
        this.errors.countDocuments(),
        this.errors.aggregate([
          { $group: { _id: '$severity', count: { $sum: 1 } } }
        ]).toArray(),
        this.errors.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray(),
        this.errors.countDocuments({ createdAt: { $gte: yesterday } }),
      ]);

      return {
        total,
        bySeverity: Object.fromEntries(bySeverity.map(s => [s._id, s.count])),
        byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
        last24h,
      };
    }

    // In-memory stats
    return {
      total: this.inMemoryErrors.length,
      bySeverity: this.inMemoryErrors.reduce((acc, e) => {
        acc[e.severity] = (acc[e.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: this.inMemoryErrors.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      last24h: this.inMemoryErrors.filter(e => e.createdAt >= yesterday).length,
    };
  }

  private buildQuery(filters: ErrorFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (filters.severity) {
      query.severity = filters.severity;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.file) {
      query.file = { $regex: filters.file, $options: 'i' };
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        (query.createdAt as Record<string, unknown>).$gte = filters.startDate;
      }
      if (filters.endDate) {
        (query.createdAt as Record<string, unknown>).$lte = filters.endDate;
      }
    }
    if (filters.search) {
      query.$or = [
        { message: { $regex: filters.search, $options: 'i' } },
        { file: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  private formatTimeLabel(date: Date, range: string): string {
    if (range === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    const hours = date.getHours();
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${displayHours}${period}`;
  }

  private seedMockData(): void {
    // Seed with mock errors for demo
    const now = new Date();
    const mockErrors: ErrorDocument[] = [
      {
        id: uuidv4(),
        message: "TypeError: Cannot read property 'profile' of undefined",
        stack: "at processCheckout (src/checkout/processOrder.ts:246:22)\n    at handleSubmit (src/checkout/CheckoutForm.tsx:89:5)",
        file: 'src/checkout/processOrder.ts',
        line: 246,
        severity: 'critical',
        status: 'new',
        affectedUsers: 47,
        sessions: 234,
        environment: 'production',
        browser: 'Chrome 120',
        fingerprint: 'mock-fp-1',
        occurrences: 47,
        firstSeen: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        lastSeen: new Date(now.getTime() - 23 * 60 * 1000),
        createdAt: new Date(now.getTime() - 23 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 23 * 60 * 1000),
      },
      {
        id: uuidv4(),
        message: "ReferenceError: userId is not defined",
        stack: "at getUserProfile (src/api/users.ts:45:10)",
        file: 'src/api/users.ts',
        line: 45,
        severity: 'high',
        status: 'acknowledged',
        affectedUsers: 12,
        sessions: 56,
        environment: 'production',
        fingerprint: 'mock-fp-2',
        occurrences: 12,
        firstSeen: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        lastSeen: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        id: uuidv4(),
        message: "SyntaxError: Unexpected token in JSON",
        stack: "at JSON.parse (<anonymous>)\n    at parseResponse (src/utils/api.ts:23:8)",
        file: 'src/utils/api.ts',
        line: 23,
        severity: 'medium',
        status: 'resolved',
        affectedUsers: 5,
        sessions: 8,
        environment: 'staging',
        fingerprint: 'mock-fp-3',
        occurrences: 5,
        firstSeen: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        lastSeen: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        id: uuidv4(),
        message: "NetworkError: Failed to fetch /api/checkout",
        stack: "at fetch (src/services/checkout.ts:45:10)\n    at processPayment (src/pages/Checkout.tsx:89:5)",
        file: 'src/services/checkout.ts',
        line: 45,
        severity: 'high',
        status: 'new',
        affectedUsers: 89,
        sessions: 156,
        environment: 'production',
        fingerprint: 'mock-fp-4',
        occurrences: 89,
        firstSeen: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        lastSeen: new Date(now.getTime() - 5 * 60 * 1000),
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 60 * 1000),
      },
      {
        id: uuidv4(),
        message: "RangeError: Maximum call stack size exceeded",
        stack: "at recursiveFunction (src/utils/tree.ts:12:5)\n    at recursiveFunction (src/utils/tree.ts:15:10)",
        file: 'src/utils/tree.ts',
        line: 12,
        severity: 'critical',
        status: 'new',
        affectedUsers: 3,
        sessions: 3,
        environment: 'production',
        fingerprint: 'mock-fp-5',
        occurrences: 3,
        firstSeen: new Date(now.getTime() - 10 * 60 * 1000),
        lastSeen: new Date(now.getTime() - 2 * 60 * 1000),
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 60 * 1000),
      },
    ];

    this.inMemoryErrors = mockErrors;
    console.log('📦 Seeded with mock data:', mockErrors.length, 'errors');
  }
}

// Export singleton instance
export const errorService = new ErrorService();
