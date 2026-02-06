/**
 * Tambo API Client - Frontend library for ErrorIQ backend integration
 */

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';

// Re-export types from types file
export type {
  ErrorRecord,
  ErrorAnalysis,
  TimelineData,
  ChatResponse,
  ActionResult,
  ErrorFilters,
  WebSocketMessage,
} from './tambo-types';

import type {
  ErrorRecord,
  ErrorAnalysis,
  TimelineData,
  ChatResponse,
  ActionResult,
  ErrorFilters,
  WebSocketMessage,
} from './tambo-types';

// ============================================
// API Client Class
// ============================================

class TamboClient {
  private ws: WebSocket | null = null;
  private wsListeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // ----------------------------------------
  // Error Endpoints
  // ----------------------------------------

  async submitError(error: {
    message: string;
    stack?: string;
    file?: string;
    line?: number;
    severity?: string;
  }): Promise<ErrorRecord> {
    const response = await fetch(`${API_URL}/api/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit error: ${response.statusText}`);
    }

    return response.json();
  }

  async getErrors(filters: ErrorFilters = {}): Promise<{ errors: ErrorRecord[]; count: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_URL}/api/errors?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch errors: ${response.statusText}`);
    }

    return response.json();
  }

  async getError(id: string): Promise<ErrorRecord> {
    const response = await fetch(`${API_URL}/api/errors/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch error: ${response.statusText}`);
    }

    return response.json();
  }

  async getTimeline(range: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<TimelineData> {
    const response = await fetch(`${API_URL}/api/errors/timeline/${range}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch timeline: ${response.statusText}`);
    }

    return response.json();
  }

  async getStats(): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    last24h: number;
  }> {
    const response = await fetch(`${API_URL}/api/errors/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return response.json();
  }

  async updateErrorStatus(id: string, status: 'new' | 'acknowledged' | 'resolved'): Promise<ErrorRecord> {
    const response = await fetch(`${API_URL}/api/errors/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update error status: ${response.statusText}`);
    }

    return response.json();
  }

  // ----------------------------------------
  // Analysis Endpoints
  // ----------------------------------------

  async analyzeError(request: {
    errorMessage: string;
    stackTrace?: string;
    context?: {
      file?: string;
      line?: number;
      function?: string;
    };
  }): Promise<ErrorAnalysis> {
    const response = await fetch(`${API_URL}/api/analysis/error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze error: ${response.statusText}`);
    }

    return response.json();
  }

  async chat(message: string, errorContext?: Record<string, unknown>): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/api/analysis/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, errorContext }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send chat message: ${response.statusText}`);
    }

    return response.json();
  }

  async *streamAnalysis(request: {
    errorMessage: string;
    stackTrace?: string;
    context?: Record<string, unknown>;
  }): AsyncGenerator<string> {
    const response = await fetch(`${API_URL}/api/analysis/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to stream analysis: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (data.done) return;
          yield data.content;
        }
      }
    }
  }

  // ----------------------------------------
  // Action Endpoints
  // ----------------------------------------

  async rollback(targetVersion: string, options?: {
    reason?: string;
    errorId?: string;
  }): Promise<ActionResult> {
    const response = await fetch(`${API_URL}/api/actions/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetVersion, ...options }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initiate rollback: ${response.statusText}`);
    }

    return response.json();
  }

  async notify(channels: string[], options?: {
    message?: string;
    errorId?: string;
    severity?: string;
    mentionTeam?: boolean;
  }): Promise<ActionResult> {
    const response = await fetch(`${API_URL}/api/actions/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channels, ...options }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send notifications: ${response.statusText}`);
    }

    return response.json();
  }

  async createTicket(title: string, options?: {
    description?: string;
    priority?: string;
    assignee?: string;
    errorId?: string;
    labels?: string[];
  }): Promise<ActionResult> {
    const response = await fetch(`${API_URL}/api/actions/create-ticket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, ...options }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ticket: ${response.statusText}`);
    }

    return response.json();
  }

  async applyFix(errorId: string, fixCode: string, options?: {
    targetFile?: string;
    createPR?: boolean;
  }): Promise<ActionResult> {
    const response = await fetch(`${API_URL}/api/actions/apply-fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorId, fixCode, ...options }),
    });

    if (!response.ok) {
      throw new Error(`Failed to apply fix: ${response.statusText}`);
    }

    return response.json();
  }

  async silenceAlerts(errorId: string, duration: string, reason?: string): Promise<ActionResult> {
    const response = await fetch(`${API_URL}/api/actions/silence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorId, duration, reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to silence alerts: ${response.statusText}`);
    }

    return response.json();
  }

  // ----------------------------------------
  // WebSocket Methods
  // ----------------------------------------

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('Connected to ErrorIQ real-time updates');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifyListeners(message.type, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from real-time updates');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(eventType: string, callback: (data: unknown) => void): () => void {
    if (!this.wsListeners.has(eventType)) {
      this.wsListeners.set(eventType, new Set());
    }
    this.wsListeners.get(eventType)!.add(callback);

    return () => {
      this.wsListeners.get(eventType)?.delete(callback);
    };
  }

  private notifyListeners(eventType: string, data: unknown): void {
    this.wsListeners.get(eventType)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });

    this.wsListeners.get('*')?.forEach(callback => {
      try {
        callback({ type: eventType, data });
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // ----------------------------------------
  // Health Check
  // ----------------------------------------

  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    services: Record<string, string>;
  }> {
    const response = await fetch(`${API_URL}/health`);
    
    if (!response.ok) {
      throw new Error('Backend health check failed');
    }

    return response.json();
  }
}

// Export singleton instance
export const tamboClient = new TamboClient();

// Also export the class for custom instances
export { TamboClient };
