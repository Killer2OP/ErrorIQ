/**
 * ErrorIQ Browser SDK
 * Automatic error capture and reporting for JavaScript applications
 */

export interface ErrorIQConfig {
  apiKey?: string;
  projectId?: string;
  endpoint?: string;
  environment?: string;
  enableConsoleCapture?: boolean;
  maxBreadcrumbs?: number;
  beforeSend?: (error: ErrorPayload) => ErrorPayload | null;
}

export interface ErrorPayload {
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  type?: string;
  timestamp: string;
  url?: string;
  projectId?: string;
  environment?: EnvironmentInfo;
  user?: UserContext;
  device?: DeviceInfo;
  breadcrumbs?: Breadcrumb[];
  metadata?: Record<string, unknown>;
}

export interface EnvironmentInfo {
  browser: string;
  screen: string;
  viewport: string;
  language: string;
  timezone: string;
}

export interface UserContext {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export interface DeviceInfo {
  platform: string;
  browser: string;
  cores?: number;
  memory?: number;
}

export interface Breadcrumb {
  type: 'click' | 'navigation' | 'xhr' | 'console' | 'error' | 'custom';
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

class ErrorIQClient {
  private config: Required<Pick<ErrorIQConfig, 'endpoint' | 'maxBreadcrumbs' | 'enableConsoleCapture'>> & ErrorIQConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private userContext: UserContext = {};
  private initialized = false;
  private originalConsoleError: typeof console.error | null = null;

  constructor(config: ErrorIQConfig = {}) {
    this.config = {
      endpoint: 'http://localhost:3001/api/errors',
      maxBreadcrumbs: 20,
      enableConsoleCapture: true,
      ...config,
    };
  }

  /**
   * Initialize automatic error capture
   */
  init(): void {
    if (this.initialized) {
      console.warn('ErrorIQ: Already initialized');
      return;
    }

    if (typeof window === 'undefined') {
      console.warn('ErrorIQ: SDK requires browser environment');
      return;
    }

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        type: event.error?.name || 'Error',
        severity: 'high',
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      this.captureError({
        message: error?.message || String(error) || 'Unhandled Promise Rejection',
        stack: error?.stack,
        type: 'UnhandledRejection',
        severity: 'high',
      });
    });

    // Override console.error
    if (this.config.enableConsoleCapture) {
      this.originalConsoleError = console.error;
      console.error = (...args) => {
        this.addBreadcrumb({
          type: 'console',
          message: args.map(a => String(a)).join(' '),
          timestamp: Date.now(),
        });
        this.originalConsoleError?.apply(console, args);
      };
    }

    // Track navigation
    window.addEventListener('popstate', () => {
      this.addBreadcrumb({
        type: 'navigation',
        message: `Navigated to ${window.location.pathname}`,
        timestamp: Date.now(),
        data: { url: window.location.href },
      });
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        const identifier = target.id || target.className || target.tagName;
        this.addBreadcrumb({
          type: 'click',
          message: `Clicked on ${identifier}`,
          timestamp: Date.now(),
          data: { 
            tagName: target.tagName,
            id: target.id,
            className: target.className,
          },
        });
      }
    });

    this.initialized = true;
    console.log('🔍 ErrorIQ: SDK initialized');
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: UserContext): void {
    this.userContext = { ...this.userContext, ...user };
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    this.userContext = {};
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Capture and send an error
   */
  captureError(errorData: Partial<ErrorPayload>): void {
    const payload: ErrorPayload = {
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      file: errorData.file,
      line: errorData.line,
      column: errorData.column,
      severity: errorData.severity || 'medium',
      type: errorData.type,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      projectId: this.config.projectId,
      environment: this.getEnvironment(),
      user: Object.keys(this.userContext).length > 0 ? this.userContext : undefined,
      device: this.getDeviceInfo(),
      breadcrumbs: [...this.breadcrumbs],
      metadata: errorData.metadata,
    };

    // Allow user to modify or cancel
    const finalPayload = this.config.beforeSend?.(payload) ?? payload;
    if (!finalPayload) {
      return;
    }

    this.sendError(finalPayload);
  }

  /**
   * Capture a message (non-error)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    const severityMap = {
      info: 'low' as const,
      warning: 'medium' as const,
      error: 'high' as const,
    };

    this.captureError({
      message,
      severity: severityMap[level],
      type: 'Message',
    });
  }

  /**
   * Create a test error (for demo purposes)
   */
  testError(): void {
    try {
      throw new Error('ErrorIQ Test Error - SDK is working correctly!');
    } catch (error) {
      if (error instanceof Error) {
        this.captureError({
          message: error.message,
          stack: error.stack,
          type: 'TestError',
          severity: 'low',
        });
      }
    }
  }

  private getEnvironment(): EnvironmentInfo {
    if (typeof window === 'undefined') {
      return {
        browser: 'node',
        screen: 'n/a',
        viewport: 'n/a',
        language: 'en',
        timezone: 'UTC',
      };
    }

    return {
      browser: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private getDeviceInfo(): DeviceInfo {
    if (typeof navigator === 'undefined') {
      return { platform: 'node', browser: 'node' };
    }

    return {
      platform: navigator.platform,
      browser: this.parseBrowser(navigator.userAgent),
      cores: navigator.hardwareConcurrency,
      memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    };
  }

  private parseBrowser(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private async sendError(payload: ErrorPayload): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['X-API-Key'] = this.config.apiKey;
      }

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn('ErrorIQ: Failed to send error', response.status);
      }
    } catch (err) {
      console.warn('ErrorIQ: Failed to send error', err);
    }
  }

  /**
   * Cleanup SDK
   */
  destroy(): void {
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
    this.breadcrumbs = [];
    this.initialized = false;
  }
}

// Export singleton and class
export const erroriq = new ErrorIQClient();
export { ErrorIQClient };
export default ErrorIQClient;
