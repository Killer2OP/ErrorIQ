/**
 * Demo Error Scenarios - 10 varied error scenarios for hackathon demos
 * Each scenario includes full context for different error types
 */

export interface DemoScenario {
  id: string;
  name: string;
  errorType: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'third_party';
  severity: 'low' | 'medium' | 'high' | 'critical';
  error: {
    type: string;
    message: string;
    file: string;
    line: number;
    stack: string;
  };
  impact: {
    affectedUsers: number;
    sessions: number;
    revenue: number;
    regions: string[];
  };
  userJourney: Array<{
    id: number;
    name: string;
    time: string;
    status: 'completed' | 'error' | 'success';
  }>;
  suggestedFix: {
    description: string;
    beforeCode: string;
    afterCode: string;
    confidence: number;
  };
  suggestedComponents: string[];
}

export const demoScenarios: DemoScenario[] = [
  // Scenario 1: Null Pointer in Checkout (Current Default)
  {
    id: 'null-checkout',
    name: 'Null Reference in Checkout',
    errorType: 'null_pointer',
    category: 'frontend',
    severity: 'critical',
    error: {
      type: 'TypeError',
      message: "Cannot read property 'profile' of undefined",
      file: 'src/checkout/processOrder.ts',
      line: 246,
      stack: `TypeError: Cannot read property 'profile' of undefined
    at processCheckout (src/checkout/processOrder.ts:246:22)
    at handleSubmit (src/checkout/CheckoutForm.tsx:89:5)
    at HTMLFormElement.onsubmit (src/checkout/CheckoutForm.tsx:45:12)`,
    },
    impact: {
      affectedUsers: 47,
      sessions: 234,
      revenue: 12340,
      regions: ['US-East (96%)', 'US-West (4%)'],
    },
    userJourney: [
      { id: 1, name: 'Email Campaign', time: '12:30 PM', status: 'success' },
      { id: 2, name: 'Product Page', time: '12:31 PM', status: 'completed' },
      { id: 3, name: 'Cart Page', time: '12:32 PM', status: 'completed' },
      { id: 4, name: 'Checkout Error', time: '12:33 PM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Add optional chaining and guest profile fallback',
      beforeCode: 'const userProfile = cart.user.profile;',
      afterCode: 'const userProfile = cart.user?.profile || getGuestProfile();',
      confidence: 92,
    },
    suggestedComponents: ['UserJourney', 'StackTrace', 'SimilarErrors', 'SuggestedFix'],
  },

  // Scenario 2: API Timeout on Payment
  {
    id: 'api-timeout-payment',
    name: 'Payment API Timeout',
    errorType: 'api_timeout',
    category: 'backend',
    severity: 'critical',
    error: {
      type: 'TimeoutError',
      message: '502 Gateway Timeout on POST /api/payments/process',
      file: 'src/api/payments.ts',
      line: 78,
      stack: `TimeoutError: Gateway Timeout
    at PaymentService.processPayment (src/api/payments.ts:78:11)
    at async handlePayment (src/checkout/PaymentHandler.tsx:34:7)
    at async submitOrder (src/checkout/OrderFlow.tsx:156:5)`,
    },
    impact: {
      affectedUsers: 89,
      sessions: 412,
      revenue: 28500,
      regions: ['US-East (42%)', 'Europe (38%)', 'Asia (20%)'],
    },
    userJourney: [
      { id: 1, name: 'Cart Review', time: '2:15 PM', status: 'success' },
      { id: 2, name: 'Enter Payment', time: '2:16 PM', status: 'completed' },
      { id: 3, name: 'Processing...', time: '2:17 PM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Add timeout handling with retry and fallback payment processor',
      beforeCode: `const result = await paymentAPI.process(order);`,
      afterCode: `const result = await withRetry(
  () => paymentAPI.process(order),
  { retries: 3, timeout: 10000 }
);`,
      confidence: 85,
    },
    suggestedComponents: ['ErrorTimeline', 'InfrastructureHealth', 'ImpactMetrics', 'QuickActions'],
  },

  // Scenario 3: Auth Token Expiration
  {
    id: 'auth-token-expired',
    name: 'JWT Token Expired',
    errorType: 'auth_failure',
    category: 'backend',
    severity: 'high',
    error: {
      type: 'UnauthorizedError',
      message: '401 Unauthorized: JWT token expired',
      file: 'src/middleware/auth.ts',
      line: 45,
      stack: `UnauthorizedError: jwt expired
    at verifyToken (src/middleware/auth.ts:45:15)
    at authMiddleware (src/middleware/auth.ts:23:12)
    at Layer.handle (node_modules/express/lib/router/layer.js:95:5)`,
    },
    impact: {
      affectedUsers: 156,
      sessions: 890,
      revenue: 0,
      regions: ['Global'],
    },
    userJourney: [
      { id: 1, name: 'Login (1 hour ago)', time: '1:00 PM', status: 'success' },
      { id: 2, name: 'Browse Products', time: '1:30 PM', status: 'completed' },
      { id: 3, name: 'Add to Cart', time: '2:00 PM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Implement automatic token refresh with silent renewal',
      beforeCode: `// Token check only on request
if (!token) throw new UnauthorizedError();`,
      afterCode: `// Auto-refresh before expiry
if (isTokenExpiringSoon(token)) {
  token = await refreshToken();
}`,
      confidence: 88,
    },
    suggestedComponents: ['ImpactMetrics', 'UserJourney', 'SuggestedFix', 'QuickActions'],
  },

  // Scenario 4: Database Connection Pool Exhausted
  {
    id: 'db-pool-exhausted',
    name: 'Database Pool Exhausted',
    errorType: 'db_error',
    category: 'database',
    severity: 'critical',
    error: {
      type: 'DatabaseError',
      message: 'Connection pool exhausted - no available connections',
      file: 'src/db/pool.ts',
      line: 89,
      stack: `DatabaseError: Connection pool exhausted
    at Pool.getConnection (src/db/pool.ts:89:13)
    at UserRepository.findById (src/repositories/user.ts:23:18)
    at UserService.getUser (src/services/user.ts:45:12)`,
    },
    impact: {
      affectedUsers: 1240,
      sessions: 5600,
      revenue: 45000,
      regions: ['All regions affected'],
    },
    userJourney: [
      { id: 1, name: 'Page Load', time: '3:00 PM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Increase pool size and add connection timeout handling',
      beforeCode: `const pool = new Pool({ max: 10 });`,
      afterCode: `const pool = new Pool({
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});`,
      confidence: 80,
    },
    suggestedComponents: ['InfrastructureHealth', 'ErrorTimeline', 'SimilarErrors', 'QuickActions'],
  },

  // Scenario 5: CORS Error
  {
    id: 'cors-blocked',
    name: 'CORS Policy Blocking',
    errorType: 'cors_error',
    category: 'frontend',
    severity: 'medium',
    error: {
      type: 'CORSError',
      message: 'Blocked by CORS policy: No Access-Control-Allow-Origin header',
      file: 'src/api/client.ts',
      line: 34,
      stack: `CORSError: Cross-Origin Request Blocked
    at fetch (src/api/client.ts:34:5)
    at APIClient.get (src/api/client.ts:56:12)
    at loadUserData (src/pages/Profile.tsx:23:8)`,
    },
    impact: {
      affectedUsers: 23,
      sessions: 56,
      revenue: 0,
      regions: ['Staging environment'],
    },
    userJourney: [
      { id: 1, name: 'Deploy to Staging', time: '11:00 AM', status: 'success' },
      { id: 2, name: 'Test Profile Page', time: '11:05 AM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Configure CORS headers on backend to allow staging origin',
      beforeCode: `app.use(cors());`,
      afterCode: `app.use(cors({
  origin: ['https://staging.example.com', 'http://localhost:5173'],
  credentials: true,
}));`,
      confidence: 95,
    },
    suggestedComponents: ['StackTrace', 'SuggestedFix', 'RelatedDocs'],
  },

  // Scenario 6: Memory Leak
  {
    id: 'memory-leak',
    name: 'React Component Memory Leak',
    errorType: 'memory_leak',
    category: 'frontend',
    severity: 'high',
    error: {
      type: 'MemoryWarning',
      message: 'Memory usage exceeded 1.5GB - potential memory leak detected',
      file: 'src/components/LiveChart.tsx',
      line: 67,
      stack: `MemoryWarning: Heap snapshot shows growing detached DOM nodes
    at LiveChart.componentDidUpdate (src/components/LiveChart.tsx:67:5)
    at updateComponent (react-dom.js:12453:12)`,
    },
    impact: {
      affectedUsers: 340,
      sessions: 1200,
      revenue: 8900,
      regions: ['Desktop users (Chrome)'],
    },
    userJourney: [
      { id: 1, name: 'Open Dashboard', time: '9:00 AM', status: 'success' },
      { id: 2, name: 'View Charts (30 min)', time: '9:30 AM', status: 'completed' },
      { id: 3, name: 'Browser Crash', time: '10:00 AM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Clean up chart subscription in useEffect cleanup',
      beforeCode: `useEffect(() => {
  chartLib.subscribe(updateData);
}, []);`,
      afterCode: `useEffect(() => {
  const sub = chartLib.subscribe(updateData);
  return () => sub.unsubscribe();
}, []);`,
      confidence: 90,
    },
    suggestedComponents: ['ErrorTimeline', 'InfrastructureHealth', 'ImpactMetrics'],
  },

  // Scenario 7: Rate Limiting
  {
    id: 'rate-limit',
    name: 'API Rate Limit Exceeded',
    errorType: 'rate_limit',
    category: 'backend',
    severity: 'medium',
    error: {
      type: 'RateLimitError',
      message: '429 Too Many Requests - Rate limit exceeded',
      file: 'src/api/search.ts',
      line: 23,
      stack: `RateLimitError: Rate limit of 100 requests/minute exceeded
    at SearchAPI.query (src/api/search.ts:23:11)
    at handleSearch (src/pages/Search.tsx:45:8)`,
    },
    impact: {
      affectedUsers: 78,
      sessions: 234,
      revenue: 1200,
      regions: ['Power users'],
    },
    userJourney: [
      { id: 1, name: 'Type in Search', time: '4:00 PM', status: 'success' },
      { id: 2, name: 'Rapid Queries', time: '4:00 PM', status: 'completed' },
      { id: 3, name: 'Rate Limited', time: '4:01 PM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Add debouncing to search input',
      beforeCode: `onChange={(e) => search(e.target.value)}`,
      afterCode: `onChange={useDebouncedCallback(
  (e) => search(e.target.value), 
  300
)}`,
      confidence: 92,
    },
    suggestedComponents: ['ErrorTimeline', 'ImpactMetrics', 'QuickActions'],
  },

  // Scenario 8: WebSocket Disconnection
  {
    id: 'websocket-disconnect',
    name: 'WebSocket Connection Lost',
    errorType: 'websocket_error',
    category: 'frontend',
    severity: 'medium',
    error: {
      type: 'WebSocketError',
      message: 'WebSocket connection closed unexpectedly',
      file: 'src/realtime/socket.ts',
      line: 56,
      stack: `WebSocketError: Connection closed with code 1006
    at WebSocket.onclose (src/realtime/socket.ts:56:7)
    at WebSocket.close (native)`,
    },
    impact: {
      affectedUsers: 450,
      sessions: 890,
      revenue: 0,
      regions: ['Mobile users on 4G'],
    },
    userJourney: [
      { id: 1, name: 'Open Chat', time: '5:00 PM', status: 'success' },
      { id: 2, name: 'Send Messages', time: '5:05 PM', status: 'completed' },
      { id: 3, name: 'Network Switch', time: '5:10 PM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Add auto-reconnect with exponential backoff',
      beforeCode: `ws.onclose = () => console.log('Disconnected');`,
      afterCode: `ws.onclose = () => {
  setTimeout(() => reconnect(), getBackoff());
};`,
      confidence: 88,
    },
    suggestedComponents: ['ErrorTimeline', 'InfrastructureHealth', 'UserJourney'],
  },

  // Scenario 9: Stripe API Failure
  {
    id: 'stripe-failure',
    name: 'Stripe API Unavailable',
    errorType: 'third_party_failure',
    category: 'third_party',
    severity: 'critical',
    error: {
      type: 'StripeError',
      message: 'Stripe API returned 503 Service Unavailable',
      file: 'src/payments/stripe.ts',
      line: 89,
      stack: `StripeError: Service Unavailable
    at StripeClient.createPaymentIntent (src/payments/stripe.ts:89:9)
    at PaymentService.charge (src/services/payment.ts:45:12)`,
    },
    impact: {
      affectedUsers: 234,
      sessions: 567,
      revenue: 67000,
      regions: ['All payment regions'],
    },
    userJourney: [
      { id: 1, name: 'Complete Cart', time: '6:00 PM', status: 'success' },
      { id: 2, name: 'Enter Card', time: '6:02 PM', status: 'completed' },
      { id: 3, name: 'Payment Failed', time: '6:03 PM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Add fallback payment processor and status page monitoring',
      beforeCode: `return await stripe.paymentIntents.create(data);`,
      afterCode: `try {
  return await stripe.paymentIntents.create(data);
} catch (e) {
  alertOps('Stripe down');
  return await fallbackProcessor.charge(data);
}`,
      confidence: 75,
    },
    suggestedComponents: ['InfrastructureHealth', 'ErrorTimeline', 'QuickActions', 'SimilarErrors'],
  },

  // Scenario 10: Config/Env Error
  {
    id: 'config-missing',
    name: 'Missing Environment Variable',
    errorType: 'config_error',
    category: 'infrastructure',
    severity: 'high',
    error: {
      type: 'ConfigurationError',
      message: "Environment variable 'DATABASE_URL' is not defined",
      file: 'src/config/database.ts',
      line: 12,
      stack: `ConfigurationError: DATABASE_URL is undefined
    at validateConfig (src/config/database.ts:12:9)
    at initDatabase (src/db/init.ts:8:5)
    at startServer (src/index.ts:23:3)`,
    },
    impact: {
      affectedUsers: 0,
      sessions: 0,
      revenue: 0,
      regions: ['Production deploy blocked'],
    },
    userJourney: [
      { id: 1, name: 'CI/CD Pipeline', time: '7:00 AM', status: 'success' },
      { id: 2, name: 'Deploy to Prod', time: '7:05 AM', status: 'error' },
    ],
    suggestedFix: {
      description: 'Add required env vars to deployment config',
      beforeCode: `const dbUrl = process.env.DATABASE_URL;`,
      afterCode: `const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is required');
}`,
      confidence: 98,
    },
    suggestedComponents: ['StackTrace', 'SuggestedFix', 'RelatedDocs'],
  },
];

// Helper to get scenario by ID
export const getScenarioById = (id: string): DemoScenario | undefined => {
  return demoScenarios.find(s => s.id === id);
};

// Helper to get scenarios by error type
export const getScenariosByType = (type: string): DemoScenario[] => {
  return demoScenarios.filter(s => s.errorType === type);
};

// Default scenario for initial load
export const defaultScenario = demoScenarios[0];
