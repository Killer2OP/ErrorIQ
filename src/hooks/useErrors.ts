/**
 * useErrors Hook - Fetch errors from backend with real-time updates
 * Includes mock data fallback for hackathon demo when backend is unavailable
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
  isUsingMockData: boolean;
}

interface ErrorStats {
  total: number;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  last24h: number;
}

// ============================================
// MOCK DATA FOR HACKATHON DEMO
// ============================================
const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

const MOCK_ERRORS: ErrorData[] = [
  {
    id: 'mock-err-001',
    message: "TypeError: Cannot read properties of undefined (reading 'map')",
    stack: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (src/components/UserList.tsx:42:18)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:17811:13)
    at beginWork (node_modules/react-dom/cjs/react-dom.development.js:19049:16)`,
    file: 'src/components/UserList.tsx',
    line: 42,
    column: 18,
    severity: 'critical',
    status: 'new',
    affectedUsers: 1247,
    sessions: 3891,
    environment: 'production',
    browser: 'Chrome 120',
    os: 'Windows 11',
    fingerprint: 'fp-abc123',
    occurrences: 892,
    firstSeen: daysAgo(3),
    lastSeen: hoursAgo(0.5),
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(0.5),
  },
  {
    id: 'mock-err-002',
    message: "ReferenceError: userProfile is not defined",
    stack: `ReferenceError: userProfile is not defined
    at ProfilePage (src/pages/ProfilePage.tsx:28:5)
    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
    at updateFunctionComponent (node_modules/react-dom/cjs/react-dom.development.js:17356:20)`,
    file: 'src/pages/ProfilePage.tsx',
    line: 28,
    column: 5,
    severity: 'high',
    status: 'acknowledged',
    affectedUsers: 542,
    sessions: 1203,
    environment: 'production',
    browser: 'Safari 17',
    os: 'macOS Sonoma',
    fingerprint: 'fp-def456',
    occurrences: 356,
    firstSeen: daysAgo(7),
    lastSeen: hoursAgo(2),
    createdAt: daysAgo(7),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'mock-err-003',
    message: "NetworkError: Failed to fetch user data from API endpoint",
    stack: `NetworkError: Failed to fetch user data from API endpoint
    at fetchUserData (src/services/api.ts:156:11)
    at async loadDashboard (src/pages/Dashboard.tsx:45:22)
    at async Promise.all (index 0)`,
    file: 'src/services/api.ts',
    line: 156,
    column: 11,
    severity: 'high',
    status: 'new',
    affectedUsers: 823,
    sessions: 2156,
    environment: 'production',
    browser: 'Firefox 121',
    os: 'Ubuntu 22.04',
    fingerprint: 'fp-ghi789',
    occurrences: 567,
    firstSeen: daysAgo(2),
    lastSeen: hoursAgo(1),
    createdAt: daysAgo(2),
    updatedAt: hoursAgo(1),
  },
  {
    id: 'mock-err-004',
    message: "SyntaxError: Unexpected token '<' in JSON at position 0",
    stack: `SyntaxError: Unexpected token '<' in JSON at position 0
    at JSON.parse (<anonymous>)
    at parseResponse (src/utils/http.ts:89:21)
    at async handleApiCall (src/services/api.ts:34:18)`,
    file: 'src/utils/http.ts',
    line: 89,
    column: 21,
    severity: 'medium',
    status: 'new',
    affectedUsers: 189,
    sessions: 423,
    environment: 'staging',
    browser: 'Chrome 120',
    os: 'Windows 10',
    fingerprint: 'fp-jkl012',
    occurrences: 128,
    firstSeen: daysAgo(1),
    lastSeen: hoursAgo(4),
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(4),
  },
  {
    id: 'mock-err-005',
    message: "Error: Memory limit exceeded during image processing",
    stack: `Error: Memory limit exceeded during image processing
    at processImage (src/workers/imageProcessor.ts:234:9)
    at handleUpload (src/routes/upload.ts:67:15)
    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)`,
    file: 'src/workers/imageProcessor.ts',
    line: 234,
    column: 9,
    severity: 'critical',
    status: 'new',
    affectedUsers: 67,
    sessions: 89,
    environment: 'production',
    browser: 'Chrome 120',
    os: 'Android 14',
    fingerprint: 'fp-mno345',
    occurrences: 43,
    firstSeen: hoursAgo(6),
    lastSeen: hoursAgo(0.25),
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(0.25),
  },
  {
    id: 'mock-err-006',
    message: "Warning: Each child in a list should have a unique 'key' prop",
    stack: `Warning: Each child in a list should have a unique "key" prop.
    Check the render method of \`ProductGrid\`. See https://reactjs.org/link/warning-keys for more information.
    at ProductCard (src/components/ProductCard.tsx:12:5)
    at ProductGrid (src/components/ProductGrid.tsx:45:10)`,
    file: 'src/components/ProductGrid.tsx',
    line: 45,
    column: 10,
    severity: 'low',
    status: 'resolved',
    affectedUsers: 2341,
    sessions: 8923,
    environment: 'production',
    browser: 'Edge 120',
    os: 'Windows 11',
    fingerprint: 'fp-pqr678',
    occurrences: 12567,
    firstSeen: daysAgo(14),
    lastSeen: daysAgo(1),
    createdAt: daysAgo(14),
    updatedAt: daysAgo(1),
  },
  {
    id: 'mock-err-007',
    message: "SecurityError: Blocked cross-origin frame access",
    stack: `SecurityError: Blocked cross-origin frame access
    at embedWidget (src/widgets/EmbedHandler.ts:78:14)
    at initializeWidgets (src/init.ts:23:8)
    at window.onload (src/index.ts:15:3)`,
    file: 'src/widgets/EmbedHandler.ts',
    line: 78,
    column: 14,
    severity: 'medium',
    status: 'acknowledged',
    affectedUsers: 156,
    sessions: 312,
    environment: 'production',
    browser: 'Safari 17',
    os: 'iOS 17',
    fingerprint: 'fp-stu901',
    occurrences: 89,
    firstSeen: daysAgo(5),
    lastSeen: hoursAgo(8),
    createdAt: daysAgo(5),
    updatedAt: hoursAgo(8),
  },
  {
    id: 'mock-err-008',
    message: "UnhandledPromiseRejection: Database connection timeout after 30000ms",
    stack: `UnhandledPromiseRejection: Database connection timeout after 30000ms
    at MongoClient.connect (node_modules/mongodb/lib/mongo_client.js:234:23)
    at async connectDB (src/db/connection.ts:45:5)
    at async startServer (src/server.ts:12:3)`,
    file: 'src/db/connection.ts',
    line: 45,
    column: 5,
    severity: 'critical',
    status: 'new',
    affectedUsers: 0,
    sessions: 0,
    environment: 'production',
    browser: 'N/A',
    os: 'Linux',
    fingerprint: 'fp-vwx234',
    occurrences: 12,
    firstSeen: hoursAgo(1),
    lastSeen: hoursAgo(0.1),
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(0.1),
  },
];

const MOCK_STATS: ErrorStats = {
  total: 2634,
  bySeverity: {
    critical: 156,
    high: 423,
    medium: 892,
    low: 1163,
  },
  byStatus: {
    new: 1247,
    acknowledged: 678,
    resolved: 709,
  },
  last24h: 347,
};

export function useErrors(options: UseErrorsOptions = {}): UseErrorsReturn {
  const { severity, status, limit = 50, autoRefresh = true } = options;
  
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

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
      setIsUsingMockData(false);
    } catch (err) {
      // Fallback to mock data when backend is unavailable
      console.log('⚠️ Backend unavailable, using mock data for demo');
      
      // Filter mock errors based on options
      let filteredMockErrors = [...MOCK_ERRORS];
      if (severity) {
        filteredMockErrors = filteredMockErrors.filter(e => e.severity === severity);
      }
      if (status) {
        filteredMockErrors = filteredMockErrors.filter(e => e.status === status);
      }
      
      setErrors(filteredMockErrors.slice(0, limit));
      setStats(MOCK_STATS);
      setIsUsingMockData(true);
      setError(null); // Clear error since we have fallback data
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
        setIsUsingMockData(false);
      }
    } catch {
      // Fall back to mock stats - use functional update to check current value
      setStats(currentStats => {
        if (!currentStats) {
          setIsUsingMockData(true);
          return MOCK_STATS;
        }
        return currentStats;
      });
    }
  }, []); // Empty deps - no more infinite loop!

  // Initial fetch - only run once on mount
  useEffect(() => {
    fetchErrors();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

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
    isUsingMockData,
  };
}

export default useErrors;

