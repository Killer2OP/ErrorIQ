/**
 * MCP (Model Context Protocol) Service - Hybrid AI-powered error analysis
 * Uses Bytez SDK for multi-model access with smart mock fallbacks
 */

import Bytez from 'bytez.js';

// Types for MCP service
export type ErrorType = 
  | 'null_pointer' 
  | 'api_timeout' 
  | 'auth_failure' 
  | 'db_error' 
  | 'cors_error'
  | 'memory_leak'
  | 'rate_limit'
  | 'websocket_error'
  | 'third_party_failure'
  | 'config_error'
  | 'unknown';

export type ErrorCategory = 'frontend' | 'backend' | 'database' | 'infrastructure' | 'third_party';

export interface ErrorContext {
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  environment?: string;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorAnalysis {
  errorType: ErrorType;
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  rootCause: string;
  explanation: string;
  suggestedComponents: string[];
  suggestedFix: {
    code: string;
    description: string;
    confidence: number;
  };
  preventionTips: string[];
  similarPatterns: string[];
  estimatedImpact: {
    affectedUsers: number;
    sessions: number;
    revenue: number;
    regionsAffected: string[];
  };
}

export interface SimilarError {
  id: string;
  message: string;
  similarity: number;
  resolution: string;
  resolvedBy: string;
  date: string;
  status: 'fixed' | 'partial' | 'unresolved';
}

// Error pattern matchers
const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  type: ErrorType;
  category: ErrorCategory;
}> = [
  { 
    pattern: /cannot read property|undefined is not|null is not|typeerror.*undefined|typeerror.*null/i, 
    type: 'null_pointer', 
    category: 'frontend' 
  },
  { 
    pattern: /timeout|econnreset|etimedout|gateway timeout|502|504|econnrefused/i, 
    type: 'api_timeout', 
    category: 'backend' 
  },
  { 
    pattern: /unauthorized|forbidden|401|403|jwt|token.*expired|invalid.*token|authentication/i, 
    type: 'auth_failure', 
    category: 'backend' 
  },
  { 
    pattern: /database|mongodb|postgres|mysql|connection pool|query failed|deadlock/i, 
    type: 'db_error', 
    category: 'database' 
  },
  { 
    pattern: /cors|cross-origin|access-control-allow|blocked by cors/i, 
    type: 'cors_error', 
    category: 'frontend' 
  },
  { 
    pattern: /memory|heap|out of memory|allocation failed|gc overhead/i, 
    type: 'memory_leak', 
    category: 'infrastructure' 
  },
  { 
    pattern: /rate limit|too many requests|429|throttl/i, 
    type: 'rate_limit', 
    category: 'backend' 
  },
  { 
    pattern: /websocket|socket.*closed|connection.*lost|ws:/i, 
    type: 'websocket_error', 
    category: 'frontend' 
  },
  { 
    pattern: /stripe|twilio|sendgrid|aws|s3|cloudinary|third.?party/i, 
    type: 'third_party_failure', 
    category: 'third_party' 
  },
  { 
    pattern: /config|environment|env.*undefined|missing.*variable|not configured/i, 
    type: 'config_error', 
    category: 'infrastructure' 
  },
];

// Component recommendations by error type
const COMPONENT_MAP: Record<ErrorType, string[]> = {
  null_pointer: ['UserJourney', 'StackTrace', 'SimilarErrors', 'SuggestedFix'],
  api_timeout: ['ErrorTimeline', 'InfrastructureHealth', 'ImpactMetrics', 'QuickActions'],
  auth_failure: ['ImpactMetrics', 'UserJourney', 'SuggestedFix', 'QuickActions'],
  db_error: ['InfrastructureHealth', 'ErrorTimeline', 'SimilarErrors', 'QuickActions'],
  cors_error: ['StackTrace', 'SuggestedFix', 'RelatedDocs'],
  memory_leak: ['ErrorTimeline', 'InfrastructureHealth', 'ImpactMetrics'],
  rate_limit: ['ErrorTimeline', 'ImpactMetrics', 'QuickActions'],
  websocket_error: ['ErrorTimeline', 'InfrastructureHealth', 'UserJourney'],
  third_party_failure: ['InfrastructureHealth', 'ErrorTimeline', 'QuickActions', 'SimilarErrors'],
  config_error: ['StackTrace', 'SuggestedFix', 'RelatedDocs'],
  unknown: ['StackTrace', 'ErrorTimeline', 'ImpactMetrics', 'SimilarErrors'],
};

class MCPService {
  private bytezClient: Bytez | null = null;
  private initialized = false;
  private useRealAI = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check for Bytez API key
    const bytezApiKey = process.env.BYTEZ_API_KEY;

    if (bytezApiKey && bytezApiKey !== 'your_bytez_api_key_here') {
      this.bytezClient = new Bytez(bytezApiKey);
      this.useRealAI = true;
      console.log('✅ MCP Service initialized with Bytez AI provider');
    } else {
      console.log('⚠️ MCP Service using smart mock responses (no API key found)');
    }
    
    this.initialized = true;
  }

  /**
   * Identify error type from error message and stack trace
   */
  identifyErrorType(errorMessage: string, stackTrace?: string): { type: ErrorType; category: ErrorCategory } {
    const combined = `${errorMessage} ${stackTrace || ''}`.toLowerCase();
    
    for (const { pattern, type, category } of ERROR_PATTERNS) {
      if (pattern.test(combined)) {
        return { type, category };
      }
    }
    
    return { type: 'unknown', category: 'frontend' };
  }

  /**
   * Calculate severity based on error context
   */
  calculateSeverity(
    errorType: ErrorType, 
    context: ErrorContext
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Critical paths
    if (context.file?.includes('checkout') || 
        context.file?.includes('payment') || 
        context.file?.includes('auth')) {
      return 'critical';
    }

    // Error type based severity
    const severityMap: Record<ErrorType, 'low' | 'medium' | 'high' | 'critical'> = {
      null_pointer: 'high',
      api_timeout: 'high',
      auth_failure: 'critical',
      db_error: 'critical',
      cors_error: 'medium',
      memory_leak: 'high',
      rate_limit: 'medium',
      websocket_error: 'medium',
      third_party_failure: 'high',
      config_error: 'medium',
      unknown: 'medium',
    };

    return severityMap[errorType];
  }

  /**
   * Get suggested components for rendering based on error type
   */
  getSuggestedComponents(errorType: ErrorType): string[] {
    return COMPONENT_MAP[errorType] || COMPONENT_MAP.unknown;
  }

  /**
   * Analyze an error and provide comprehensive analysis
   */
  async analyzeError(context: ErrorContext): Promise<ErrorAnalysis> {
    console.log('🔍 MCP analyzing error:', context.message);

    // Step 1: Identify error type
    const { type: errorType, category } = this.identifyErrorType(context.message, context.stack);
    
    // Step 2: Calculate severity
    const severity = this.calculateSeverity(errorType, context);
    
    // Step 3: Get suggested components
    const suggestedComponents = this.getSuggestedComponents(errorType);
    
    // Step 4: Generate analysis (use AI if available, otherwise smart mock)
    let analysis: Partial<ErrorAnalysis>;
    
    if (this.useRealAI && this.bytezClient) {
      analysis = await this.generateAIAnalysis(context, errorType);
    } else {
      analysis = this.generateMockAnalysis(context, errorType, category);
    }

    return {
      errorType,
      category,
      severity,
      suggestedComponents,
      rootCause: analysis.rootCause || 'Unable to determine root cause',
      explanation: analysis.explanation || 'Further investigation required',
      suggestedFix: analysis.suggestedFix || {
        code: '// Add error handling',
        description: 'Add proper error handling for this case',
        confidence: 50,
      },
      preventionTips: analysis.preventionTips || [],
      similarPatterns: analysis.similarPatterns || [],
      estimatedImpact: {
        affectedUsers: Math.floor(Math.random() * 100) + 10,
        sessions: Math.floor(Math.random() * 500) + 50,
        revenue: Math.floor(Math.random() * 20000) + 1000,
        regionsAffected: ['US-East', 'US-West'],
      },
    };
  }

  /**
   * Generate AI-powered analysis using Bytez SDK
   */
  private async generateAIAnalysis(
    context: ErrorContext, 
    errorType: ErrorType
  ): Promise<Partial<ErrorAnalysis>> {
    try {
      if (!this.bytezClient) {
        throw new Error('Bytez client not initialized');
      }

      const prompt = this.buildAnalysisPrompt(context, errorType);
      
      // Use Bytez SDK with Claude model
      const model = this.bytezClient.model('anthropic/claude-opus-4-1');
      
      const { error, output } = await model.run([
        {
          role: 'user',
          content: `You are an expert software engineer analyzing production errors. 
Provide concise, actionable analysis with specific code fixes. 
Format your response as JSON with: rootCause, explanation, suggestedFix (code, description, confidence 0-100), preventionTips (array), similarPatterns (array).

${prompt}`,
        },
      ]);

      if (error) {
        console.error('Bytez API error:', error);
        throw new Error(String(error));
      }

      if (output) {
        // Extract JSON from the response
        const jsonMatch = String(output).match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('AI analysis failed, falling back to mock:', error);
    }

    // Fallback to mock if AI fails
    return this.generateMockAnalysis(context, errorType, 'frontend');
  }

  /**
   * Build prompt for AI analysis
   */
  private buildAnalysisPrompt(context: ErrorContext, errorType: ErrorType): string {
    return `Analyze this ${errorType} production error:

Error Message: ${context.message}
${context.stack ? `Stack Trace:\n${context.stack}` : ''}
${context.file ? `File: ${context.file}` : ''}
${context.line ? `Line: ${context.line}` : ''}
${context.environment ? `Environment: ${context.environment}` : ''}

Provide:
1. Root cause analysis
2. Clear explanation for developers
3. Specific code fix with confidence score
4. Prevention tips for the future
5. Similar patterns this matches`;
  }

  /**
   * Generate smart mock analysis based on error type
   */
  private generateMockAnalysis(
    context: ErrorContext, 
    errorType: ErrorType,
    category: ErrorCategory
  ): Partial<ErrorAnalysis> {
    const analysisTemplates: Record<ErrorType, Partial<ErrorAnalysis>> = {
      null_pointer: {
        rootCause: `Null/undefined reference detected at ${context.file || 'unknown file'}:${context.line || 'unknown line'}. The variable being accessed is undefined at runtime.`,
        explanation: `This error occurs when trying to access a property on an undefined or null value. Common causes: 1) Data not loaded yet, 2) API response differs from expected, 3) User state not initialized.`,
        suggestedFix: {
          code: `// Before (causes error)
const value = obj.nested.property;

// After (safe access with fallback)
const value = obj?.nested?.property ?? defaultValue;

// Or with explicit check
if (obj?.nested) {
  const value = obj.nested.property;
}`,
          description: 'Use optional chaining (?.) and nullish coalescing (??) for safe property access.',
          confidence: 92,
        },
        preventionTips: [
          'Enable TypeScript strict mode',
          'Add proper loading states before accessing data',
          'Use defensive programming patterns',
          'Write unit tests for edge cases',
        ],
        similarPatterns: [
          "TypeError: Cannot read property 'user' (PR #234)",
          "Cannot access 'profile' of undefined (PR #189)",
        ],
      },
      api_timeout: {
        rootCause: 'API request exceeded timeout threshold. Server unresponsive or network congestion detected.',
        explanation: 'The request to your backend API took longer than the configured timeout. This usually indicates: 1) Server under heavy load, 2) Database query performance issues, 3) Network connectivity problems.',
        suggestedFix: {
          code: `// Add timeout handling and retry logic
const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};`,
          description: 'Implement retry logic with exponential backoff and proper timeout handling.',
          confidence: 85,
        },
        preventionTips: [
          'Add proper timeout configuration',
          'Implement circuit breaker pattern',
          'Monitor API response times',
          'Add request queuing for heavy operations',
        ],
        similarPatterns: [
          '502 Gateway Timeout on /api/payments',
          'ETIMEDOUT on database queries',
        ],
      },
      auth_failure: {
        rootCause: 'Authentication token expired or invalid. User session may have timed out.',
        explanation: 'The user\'s authentication credentials are no longer valid. This could be due to: 1) Token expiration, 2) User logged out elsewhere, 3) Token revocation, 4) Incorrect token format.',
        suggestedFix: {
          code: `// Implement token refresh logic
const refreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    redirectToLogin();
    return;
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${refreshToken}\` },
    });
    
    if (response.ok) {
      const { accessToken } = await response.json();
      setAccessToken(accessToken);
      return accessToken;
    }
  } catch (error) {
    redirectToLogin();
  }
};`,
          description: 'Implement automatic token refresh and graceful session expiration handling.',
          confidence: 88,
        },
        preventionTips: [
          'Implement automatic token refresh',
          'Add token expiration warnings',
          'Handle 401 responses globally',
          'Use secure token storage',
        ],
        similarPatterns: [
          'JWT token expired in checkout flow',
          '401 Unauthorized on protected routes',
        ],
      },
      db_error: {
        rootCause: 'Database connection pool exhausted or query timeout. High database load detected.',
        explanation: 'The database is struggling to handle the current load. Possible causes: 1) Connection pool exhausted, 2) Slow queries blocking connections, 3) Database server under strain.',
        suggestedFix: {
          code: `// Optimize database connection handling
const pool = new Pool({
  max: 20, // Increase pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Add query timeout
const result = await pool.query({
  text: 'SELECT * FROM users WHERE id = $1',
  values: [userId],
  timeout: 5000, // 5 second timeout
});`,
          description: 'Increase connection pool size and add query timeouts to prevent blocking.',
          confidence: 80,
        },
        preventionTips: [
          'Monitor database connection pool',
          'Add query timeouts',
          'Optimize slow queries',
          'Consider read replicas for heavy loads',
        ],
        similarPatterns: [
          'Connection pool exhausted during peak',
          'Query timeout on users table',
        ],
      },
      cors_error: {
        rootCause: 'Cross-Origin Resource Sharing (CORS) policy blocking request.',
        explanation: 'The browser is blocking the request due to CORS restrictions.',
        suggestedFix: {
          code: `// Server-side: Allow CORS
app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:5173'],
  credentials: true,
}));`,
          description: 'Configure CORS on your backend to allow requests from your frontend domain.',
          confidence: 95,
        },
        preventionTips: ['Configure CORS properly', 'Use same-origin when possible'],
        similarPatterns: ['CORS blocked on API calls'],
      },
      memory_leak: {
        rootCause: 'Memory not being released properly, leading to increasing memory usage.',
        explanation: 'Components or event listeners are not being cleaned up properly.',
        suggestedFix: {
          code: `// Clean up in useEffect
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);`,
          description: 'Always clean up event listeners and subscriptions in useEffect return.',
          confidence: 85,
        },
        preventionTips: ['Clean up side effects', 'Use React DevTools Profiler'],
        similarPatterns: ['Memory growing over time'],
      },
      rate_limit: {
        rootCause: 'API rate limit exceeded. Too many requests in short time period.',
        explanation: 'Your application is making too many requests to the API.',
        suggestedFix: {
          code: `// Implement request throttling
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};`,
          description: 'Add request throttling and implement backoff strategies.',
          confidence: 90,
        },
        preventionTips: ['Implement request throttling', 'Cache responses'],
        similarPatterns: ['429 Too Many Requests'],
      },
      websocket_error: {
        rootCause: 'WebSocket connection lost unexpectedly.',
        explanation: 'The real-time connection was interrupted.',
        suggestedFix: {
          code: `// Auto-reconnect WebSocket
const connect = () => {
  const ws = new WebSocket(url);
  ws.onclose = () => setTimeout(connect, 1000);
  return ws;
};`,
          description: 'Implement automatic WebSocket reconnection with backoff.',
          confidence: 88,
        },
        preventionTips: ['Implement reconnection logic', 'Add heartbeat pings'],
        similarPatterns: ['WebSocket disconnected unexpectedly'],
      },
      third_party_failure: {
        rootCause: 'Third-party service returned an error or is unavailable.',
        explanation: 'An external service your app depends on is having issues.',
        suggestedFix: {
          code: `// Add fallback for third-party failures
try {
  const result = await stripeAPI.createPayment(data);
  return result;
} catch (error) {
  await notifyOnCall('Stripe API failure');
  return { error: 'Payment service temporarily unavailable' };
}`,
          description: 'Add graceful fallbacks and alerting for third-party failures.',
          confidence: 75,
        },
        preventionTips: ['Add service health checks', 'Implement fallbacks'],
        similarPatterns: ['Stripe API timeout', 'S3 upload failed'],
      },
      config_error: {
        rootCause: 'Missing or incorrect configuration value.',
        explanation: 'An environment variable or configuration is missing or invalid.',
        suggestedFix: {
          code: `// Validate config at startup
const requiredEnvVars = ['DATABASE_URL', 'API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(\`Missing required env var: \${envVar}\`);
  }
}`,
          description: 'Add startup validation for required configuration.',
          confidence: 95,
        },
        preventionTips: ['Validate config at startup', 'Use config schemas'],
        similarPatterns: ['Undefined environment variable'],
      },
      unknown: {
        rootCause: 'Unable to automatically categorize this error.',
        explanation: 'This error pattern is not recognized. Manual investigation recommended.',
        suggestedFix: {
          code: `// Add comprehensive error handling
try {
  // Your code
} catch (error) {
  console.error('Unexpected error:', error);
  // Report to error tracking service
  reportError(error);
}`,
          description: 'Add error handling and logging for investigation.',
          confidence: 50,
        },
        preventionTips: ['Add detailed logging', 'Set up error monitoring'],
        similarPatterns: [],
      },
    };

    return analysisTemplates[errorType] || analysisTemplates.unknown;
  }

  /**
   * Find similar errors from the database
   */
  async findSimilarErrors(errorMessage: string): Promise<SimilarError[]> {
    // Mock similar errors - in production, this would query the database
    const mockSimilarErrors: SimilarError[] = [
      {
        id: '1',
        message: "TypeError: Cannot read property 'user'",
        similarity: 95,
        resolution: 'Fixed in PR #234 by @sarah - Added optional chaining',
        resolvedBy: 'sarah',
        date: '3 months ago',
        status: 'fixed',
      },
      {
        id: '2',
        message: "Cannot access 'profile' of undefined",
        similarity: 87,
        resolution: 'Fixed in PR #189 by @mike - Added null check',
        resolvedBy: 'mike',
        date: '5 months ago',
        status: 'fixed',
      },
      {
        id: '3',
        message: 'Null reference in cart processing',
        similarity: 76,
        resolution: 'Partial fix in PR #156',
        resolvedBy: 'team',
        date: '8 months ago',
        status: 'partial',
      },
    ];

    // Filter by keyword similarity
    const keywords = errorMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    return mockSimilarErrors.filter(error => 
      keywords.some(kw => error.message.toLowerCase().includes(kw))
    );
  }

  /**
   * Calculate real-time impact metrics
   */
  async calculateImpact(errorId: string): Promise<ErrorAnalysis['estimatedImpact']> {
    // Mock impact calculation - would query real metrics in production
    return {
      affectedUsers: Math.floor(Math.random() * 80) + 20,
      sessions: Math.floor(Math.random() * 400) + 100,
      revenue: Math.floor(Math.random() * 15000) + 5000,
      regionsAffected: ['US-East (96%)', 'US-West (4%)'],
    };
  }
}

// Export singleton instance
export const mcpService = new MCPService();
