/**
 * Tambo React Hooks - Custom hooks for ErrorIQ data fetching and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { tamboClient } from '../lib/tambo-client';
import type { 
  ErrorRecord, 
  ErrorAnalysis, 
  TimelineData, 
  ChatResponse,
  ActionResult,
  ErrorFilters,
} from '../lib/tambo-types';

// ============================================
// Main Analysis Hook
// ============================================

interface UseTamboReturn {
  analyzeError: (errorMessage: string, stackTrace?: string, context?: Record<string, unknown>) => Promise<void>;
  analysis: ErrorAnalysis | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useTambo(): UseTamboReturn {
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzeError = useCallback(async (
    errorMessage: string,
    stackTrace?: string,
    context?: Record<string, unknown>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await tamboClient.analyzeError({
        errorMessage,
        stackTrace,
        context,
      });
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Analysis failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return { analyzeError, analysis, loading, error, reset };
}

// ============================================
// Errors List Hook
// ============================================

interface UseErrorsReturn {
  errors: ErrorRecord[];
  count: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateStatus: (id: string, status: 'new' | 'acknowledged' | 'resolved') => Promise<void>;
}

export function useErrors(filters: ErrorFilters = {}): UseErrorsReturn {
  const [errors, setErrors] = useState<ErrorRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchErrors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await tamboClient.getErrors(filters);
      setErrors(result.errors);
      setCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch errors'));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  const updateStatus = useCallback(async (id: string, status: 'new' | 'acknowledged' | 'resolved') => {
    try {
      const updated = await tamboClient.updateErrorStatus(id, status);
      setErrors(prev => prev.map(e => e.id === id ? updated : e));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update status'));
    }
  }, []);

  return { errors, count, loading, error, refetch: fetchErrors, updateStatus };
}

// ============================================
// Timeline Hook
// ============================================

interface UseTimelineReturn {
  timeline: TimelineData['timeline'];
  deployments: TimelineData['deployments'];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTimeline(range: '1h' | '24h' | '7d' | '30d' = '24h'): UseTimelineReturn {
  const [timeline, setTimeline] = useState<TimelineData['timeline']>([]);
  const [deployments, setDeployments] = useState<TimelineData['deployments']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await tamboClient.getTimeline(range);
      setTimeline(data.timeline);
      setDeployments(data.deployments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch timeline'));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return { timeline, deployments, loading, error, refetch: fetchTimeline };
}

// ============================================
// Chat Hook
// ============================================

interface UseChatReturn {
  sendMessage: (message: string, errorContext?: Record<string, unknown>) => Promise<void>;
  response: ChatResponse | null;
  loading: boolean;
  error: Error | null;
  history: Array<{ role: 'user' | 'assistant'; content: string; data?: unknown }>;
  clearHistory: () => void;
}

export function useChat(): UseChatReturn {
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string; data?: unknown }>>([]);

  const sendMessage = useCallback(async (message: string, errorContext?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    
    // Add user message to history
    setHistory(prev => [...prev, { role: 'user', content: message }]);

    try {
      const result = await tamboClient.chat(message, errorContext);
      setResponse(result);
      
      // Add assistant response to history
      setHistory(prev => [...prev, { 
        role: 'assistant', 
        content: result.message,
        data: result.data,
      }]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Chat failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setResponse(null);
  }, []);

  return { sendMessage, response, loading, error, history, clearHistory };
}

// ============================================
// Real-time Updates Hook
// ============================================

type WebSocketEventHandler = (event: { type: string; data: unknown }) => void;

export function useRealtimeUpdates(onEvent: WebSocketEventHandler): void {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    // Connect to WebSocket
    tamboClient.connect();

    // Subscribe to all events
    const unsubscribe = tamboClient.subscribe('*', (event) => {
      handlerRef.current(event as { type: string; data: unknown });
    });

    return () => {
      unsubscribe();
    };
  }, []);
}

// ============================================
// Actions Hook
// ============================================

interface UseActionsReturn {
  rollback: (targetVersion: string, options?: { reason?: string; errorId?: string }) => Promise<ActionResult>;
  notify: (channels: string[], options?: { message?: string; errorId?: string; severity?: string }) => Promise<ActionResult>;
  createTicket: (title: string, options?: { description?: string; priority?: string; errorId?: string }) => Promise<ActionResult>;
  applyFix: (errorId: string, fixCode: string, options?: { createPR?: boolean }) => Promise<ActionResult>;
  silenceAlerts: (errorId: string, duration: string, reason?: string) => Promise<ActionResult>;
  executing: string | null;
  lastResult: ActionResult | null;
  error: Error | null;
}

export function useActions(): UseActionsReturn {
  const [executing, setExecuting] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ActionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const wrapAction = useCallback(<T extends unknown[], R>(
    actionName: string,
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      setExecuting(actionName);
      setError(null);
      
      try {
        const result = await fn(...args);
        setLastResult(result as ActionResult);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(`${actionName} failed`);
        setError(error);
        throw error;
      } finally {
        setExecuting(null);
      }
    };
  }, []);

  const rollback = useCallback(
    wrapAction('rollback', tamboClient.rollback.bind(tamboClient)),
    [wrapAction]
  );

  const notify = useCallback(
    wrapAction('notify', tamboClient.notify.bind(tamboClient)),
    [wrapAction]
  );

  const createTicket = useCallback(
    wrapAction('createTicket', tamboClient.createTicket.bind(tamboClient)),
    [wrapAction]
  );

  const applyFix = useCallback(
    wrapAction('applyFix', tamboClient.applyFix.bind(tamboClient)),
    [wrapAction]
  );

  const silenceAlerts = useCallback(
    wrapAction('silenceAlerts', tamboClient.silenceAlerts.bind(tamboClient)),
    [wrapAction]
  );

  return {
    rollback,
    notify,
    createTicket,
    applyFix,
    silenceAlerts,
    executing,
    lastResult,
    error,
  };
}

// ============================================
// Stats Hook
// ============================================

interface UseStatsReturn {
  stats: {
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    last24h: number;
  } | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<UseStatsReturn['stats']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await tamboClient.getStats();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// ============================================
// Health Check Hook
// ============================================

interface UseHealthReturn {
  isHealthy: boolean;
  status: {
    status: string;
    timestamp: string;
    version: string;
    services: Record<string, string>;
  } | null;
  loading: boolean;
  error: Error | null;
  check: () => Promise<void>;
}

export function useHealth(): UseHealthReturn {
  const [status, setStatus] = useState<UseHealthReturn['status']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await tamboClient.healthCheck();
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Health check failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const isHealthy = status?.status === 'healthy';

  return { isHealthy, status, loading, error, check };
}
