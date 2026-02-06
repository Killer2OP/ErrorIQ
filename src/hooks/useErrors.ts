/**
 * useErrors Hook - Fetch errors from backend with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001/ws';

export interface ErrorData {
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
  fingerprint?: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

interface UseErrorsOptions {
  severity?: string;
  status?: string;
  limit?: number;
  autoRefresh?: boolean;
}

interface UseErrorsReturn {
  errors: ErrorData[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  stats: ErrorStats | null;
}

interface ErrorStats {
  total: number;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  last24h: number;
}

export function useErrors(options: UseErrorsOptions = {}): UseErrorsReturn {
  const { severity, status, limit = 50, autoRefresh = true } = options;
  
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ErrorStats | null>(null);

  const fetchErrors = useCallback(async () => {
    try {
      setError(null);
      
      const params = new URLSearchParams();
      if (severity) params.append('severity', severity);
      if (status) params.append('status', status);
      params.append('limit', String(limit));

      const response = await fetch(`${API_BASE}/errors?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch errors');
      }

      const data = await response.json();
      setErrors(data.errors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [severity, status, limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/errors/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch {
      // Stats are optional, don't set error
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchErrors();
    fetchStats();
  }, [fetchErrors, fetchStats]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('🔌 Connected to ErrorIQ real-time updates');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'new_error') {
              setErrors(prev => [message.data, ...prev].slice(0, limit));
              fetchStats(); // Update stats
            } else if (message.type === 'error_updated') {
              setErrors(prev => 
                prev.map(e => e.id === message.data.id ? message.data : e)
              );
              fetchStats();
            }
          } catch {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          console.log('🔌 WebSocket disconnected, reconnecting...');
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [autoRefresh, limit, fetchStats]);

  return {
    errors,
    loading,
    error,
    refetch: fetchErrors,
    stats,
  };
}

export default useErrors;
