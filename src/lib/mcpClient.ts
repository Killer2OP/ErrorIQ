/**
 * MCP Client - Frontend client for ErrorIQ MCP Server integration
 * Provides typed methods to call the backend MCP endpoints
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
export interface ErrorAnalysis {
  errorType: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'third_party';
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

export interface ComponentRecommendation {
  errorType: string;
  components: string[];
  componentDetails: Array<{
    name: string;
    description: string;
  }>;
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

export interface StreamStep {
  step: string;
  message: string;
  analysis?: ErrorAnalysis;
  done?: boolean;
}

class MCPClient {
  /**
   * Analyze an error with full MCP pipeline
   */
  async analyzeError(params: {
    errorMessage: string;
    stackTrace?: string;
    file?: string;
    line?: number;
    metadata?: Record<string, unknown>;
  }): Promise<{ success: boolean; analysis: ErrorAnalysis }> {
    const response = await fetch(`${API_URL}/api/mcp/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`MCP analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Quick error type identification
   */
  async identifyError(params: {
    errorMessage: string;
    stackTrace?: string;
  }): Promise<{
    type: string;
    category: string;
    severity: string;
    suggestedComponents: string[];
  }> {
    const response = await fetch(`${API_URL}/api/mcp/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Error identification failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get recommended components for an error
   */
  async getComponents(params: {
    errorType?: string;
    errorMessage?: string;
    stackTrace?: string;
  }): Promise<ComponentRecommendation> {
    const response = await fetch(`${API_URL}/api/mcp/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Component recommendation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Find similar errors by message
   */
  async findSimilarErrors(errorMessage: string): Promise<{
    originalMessage: string;
    similarErrors: SimilarError[];
    count: number;
  }> {
    const response = await fetch(`${API_URL}/api/mcp/similar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errorMessage }),
    });

    if (!response.ok) {
      throw new Error(`Similar errors lookup failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Calculate impact metrics for an error
   */
  async calculateImpact(errorId: string): Promise<{
    errorId: string;
    impact: {
      affectedUsers: number;
      sessions: number;
      revenue: number;
      regionsAffected: string[];
    };
  }> {
    const response = await fetch(`${API_URL}/api/mcp/impact/${errorId}`);

    if (!response.ok) {
      throw new Error(`Impact calculation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stream analysis with progress updates (SSE)
   */
  async *streamAnalysis(params: {
    errorMessage: string;
    stackTrace?: string;
    file?: string;
    line?: number;
  }): AsyncGenerator<StreamStep> {
    const response = await fetch(`${API_URL}/api/mcp/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Stream analysis failed: ${response.statusText}`);
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
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
            if (data.done) return;
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  }

  /**
   * Check MCP service health
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    capabilities: string[];
  }> {
    const response = await fetch(`${API_URL}/api/mcp/health`);

    if (!response.ok) {
      throw new Error('MCP health check failed');
    }

    return response.json();
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();

// Also export the class for testing
export { MCPClient };
