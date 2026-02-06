// Error Timeline Data
export const errorTimelineData = [
  { time: '12am', count: 15, timestamp: '2024-01-15T00:00:00' },
  { time: '3am', count: 8, timestamp: '2024-01-15T03:00:00' },
  { time: '6am', count: 45, timestamp: '2024-01-15T06:00:00' },
  { time: '9am', count: 67, timestamp: '2024-01-15T09:00:00' },
  { time: '12pm', count: 120, timestamp: '2024-01-15T12:00:00' },
  { time: '3pm', count: 98, timestamp: '2024-01-15T15:00:00' },
  { time: '6pm', count: 78, timestamp: '2024-01-15T18:00:00' },
  { time: '9pm', count: 45, timestamp: '2024-01-15T21:00:00' },
  { time: '12am', count: 20, timestamp: '2024-01-16T00:00:00' },
];

export const deploymentMarkers = [
  { time: '12pm', version: 'v3.2.0', timestamp: '2024-01-15T12:34:00' },
  { time: '6pm', version: 'Config change', timestamp: '2024-01-15T18:15:00' },
];

// Stack Trace Data
export const stackTraceData = {
  filename: 'src/checkout/processOrder.ts',
  errorLine: 246,
  lines: [
    { number: 243, content: 'function processCheckout(cart) {', type: 'normal' as const },
    { number: 244, content: '  const userId = getUserId();', type: 'normal' as const },
    { number: 245, content: '  const discounts = calculateDiscounts(cart);', type: 'normal' as const },
    { number: 246, content: '  const userProfile = cart.user.profile;', type: 'error' as const },
    { number: 247, content: '  return createOrder(userId, cart, discounts);', type: 'normal' as const },
    { number: 248, content: '}', type: 'normal' as const },
  ],
  aiExplanation: 'cart.user is undefined when user is not logged in but has items in cart from guest session',
  suggestedFix: {
    code: 'const userProfile = cart.user?.profile || getGuestProfile();',
    confidence: 92,
  },
};

// User Journey Data
export const userJourneyData = {
  affectedUsers: 47,
  estimatedCartValue: 12340,
  steps: [
    { id: 1, name: 'Email Campaign', time: '12:30 PM', successRate: 100, status: 'success' as const },
    { id: 2, name: 'Product Page', time: '12:31 PM', successRate: 94, status: 'success' as const },
    { id: 3, name: 'Cart Page', time: '12:32 PM', successRate: 87, status: 'success' as const },
    { id: 4, name: 'Checkout Error', time: '12:33 PM', successRate: 0, status: 'error' as const },
  ],
  patterns: [
    'All users came from "Summer Sale" email link',
    'All users were NOT logged in',
    'All users had items in cart from previous session',
  ],
};

// Impact Metrics Data
export const impactMetricsData = {
  severity: 'critical' as const,
  users: 47,
  sessions: 234,
  revenue: 12340,
  regions: 3,
  firstDetected: 23,
  peakTime: 15,
  geographic: [
    { name: 'US-East', count: 45, percent: 96 },
    { name: 'US-West', count: 2, percent: 4 },
    { name: 'Europe', count: 0, percent: 0 },
  ],
};

// Infrastructure Health Data - Fixed structure
export const infrastructureHealthData = {
  lastUpdated: 1,
  services: [
    {
      id: 'database',
      name: 'Database',
      status: 'degraded' as const,
      metrics: [
        { label: 'CPU', value: 95, display: '95%' },
        { label: 'Memory', value: 64, display: '64%' },
        { label: 'Response', value: 80, display: '2.4s' },
      ],
    },
    {
      id: 'api-gateway',
      name: 'API Gateway',
      status: 'healthy' as const,
      metrics: [
        { label: 'CPU', value: 32, display: '32%' },
        { label: 'Memory', value: 41, display: '41%' },
        { label: 'Response', value: 15, display: '145ms' },
      ],
    },
    {
      id: 'cache',
      name: 'Cache',
      status: 'healthy' as const,
      metrics: [
        { label: 'CPU', value: 18, display: '18%' },
        { label: 'Memory', value: 28, display: '28%' },
        { label: 'Hit Rate', value: 94, display: '94%' },
      ],
    },
  ],
  alerts: [
    { type: 'critical' as const, icon: '🔴', message: 'Database connection pool exhausted', time: '15 min ago' },
    { type: 'warning' as const, icon: '⚠️', message: 'High query latency on users table', time: '23 min ago' },
  ],
  recentChanges: [
    { type: 'deploy' as const, icon: '📦', message: 'Deploy v3.2.0', time: '23 min ago' },
    { type: 'config' as const, icon: '⚙️', message: 'Increased DB connection timeout', time: '2 hours ago' },
  ],
};

// Quick Actions Data - Fixed structure
export const quickActionsData = {
  actions: [
    { id: 'rollback', icon: 'rollback', label: 'Rollback to v2.3.1' },
    { id: 'notify', icon: 'notify', label: 'Notify Team' },
    { id: 'jira', icon: 'flag', label: 'Create Ticket' },
    { id: 'silence', icon: 'flag', label: 'Silence Alert' },
    { id: 'logs', icon: 'report', label: 'View Logs' },
    { id: 'test', icon: 'retry', label: 'Run Test' },
  ],
  aiRecommendation: 'Based on similar past errors, rollback is most effective. Success rate: 92% (11/12 past incidents)',
};

// Similar Errors Data - Fixed structure
export const similarErrorsData = {
  errors: [
    {
      id: 1,
      similarity: 95,
      message: "TypeError: Cannot read property 'user'",
      resolution: 'Fixed in PR #234 by @sarah',
      timestamp: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000, // 3 months ago
      status: 'fixed' as const,
    },
    {
      id: 2,
      similarity: 87,
      message: "Cannot access 'profile' of undefined",
      resolution: 'Fixed in PR #189 by @mike',
      timestamp: Date.now() - 5 * 30 * 24 * 60 * 60 * 1000, // 5 months ago
      status: 'fixed' as const,
    },
    {
      id: 3,
      similarity: 76,
      message: 'Null reference in cart processing',
      resolution: 'Partial fix in PR #156',
      timestamp: Date.now() - 8 * 30 * 24 * 60 * 60 * 1000, // 8 months ago
      status: 'partial' as const,
    },
    {
      id: 4,
      similarity: 68,
      message: 'Undefined cart items on checkout',
      resolution: '',
      timestamp: Date.now() - 2 * 7 * 24 * 60 * 60 * 1000, // 2 weeks ago
      status: 'unresolved' as const,
    },
  ],
};

// Suggested Fix Data - Fixed structure
export const suggestedFixData = {
  problem: 'cart.user is undefined for guest users with saved cart items',
  description: 'Add optional chaining and fallback to guest profile handling',
  confidence: 92,
  before: 'const userProfile = cart.user.profile;',
  after: 'const userProfile = cart.user?.profile || getGuestProfile();',
  appliedCount: 11,
  teamsCount: 4,
};

// Current Error Summary
export const currentError = {
  type: 'TypeError',
  message: "Cannot read property 'profile' of undefined",
  file: 'src/checkout/processOrder.ts:246',
  timeAgo: 23,
  affectedUsers: 47,
  sessions: 234,
  cartValue: 12340,
};

// Suggested Prompts
export const suggestedPrompts = [
  { icon: '💥', text: 'Analyze TypeError in checkout' },
  { icon: '⏱️', text: 'Show API timeout errors' },
  { icon: '🔐', text: 'Debug authentication failures' },
];

// Navigation Items
export const navItems = [
  { id: 'errors', icon: '🔥', label: 'Errors', path: '/' },
  { id: 'alerts', icon: '🔔', label: 'Alerts', path: '/alerts' },
  { id: 'teams', icon: '👥', label: 'Teams', path: '/teams' },
  { id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' },
];
