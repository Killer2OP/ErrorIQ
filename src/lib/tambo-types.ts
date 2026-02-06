// Tambo API Types

export interface ErrorRecord {
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
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ErrorAnalysis {
  rootCause: string;
  explanation: string;
  suggestedFix: {
    code: string;
    description: string;
    confidence: number;
  };
  similarPatterns: string[];
  preventionTips: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: {
    users: number;
    revenue: number;
  };
}

export interface TimelineData {
  timeline: Array<{
    time: string;
    count: number;
    timestamp: string;
  }>;
  deployments: Array<{
    time: string;
    version: string;
    timestamp: string;
  }>;
}

export interface ChatResponse {
  type: string;
  message: string;
  data?: unknown;
  actions?: string[];
}

export interface ActionResult {
  actionId: string;
  message: string;
  status: string;
  [key: string]: unknown;
}

export interface ErrorFilters {
  severity?: string;
  status?: string;
  file?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface WebSocketMessage {
  type: string;
  data?: unknown;
  timestamp: string;
}
