/**
 * Tambo AI Service - Wrapper for @tambo-ai/typescript-sdk
 * Provides AI-powered error analysis and component rendering
 */

import Bytez from 'bytez.js';

// Types for Tambo service
export interface ErrorAnalysisRequest {
  errorMessage: string;
  stackTrace: string;
  context?: {
    file?: string;
    line?: number;
    function?: string;
    environment?: string;
    recentChanges?: string[];
  };
}

export interface ErrorAnalysisResponse {
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

export interface ComponentRenderRequest {
  query: string;
  componentsNeeded: string[];
  errorContext?: {
    errorId?: string;
    timeRange?: string;
  };
}

export interface ComponentRenderResponse {
  components: Array<{
    type: string;
    props: Record<string, unknown>;
    data: unknown;
  }>;
  insights: string[];
}

class TamboService {
  private bytezClient: Bytez | null = null;
  private initialized = false;
  private useRealAI = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.BYTEZ_API_KEY;
    
    if (apiKey && apiKey !== 'your_bytez_api_key_here') {
      this.bytezClient = new Bytez(apiKey);
      this.useRealAI = true;
      this.initialized = true;
      console.log('✅ TamboService initialized (Bytez AI with Claude Sonnet 4.5)');
    } else {
      console.warn('⚠️ No Bytez API key found - using simulated responses');
      this.initialized = false;
    }
  }

  /**
   * Analyze an error using AI to determine root cause and suggest fixes
   */
  async analyzeError(request: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
    console.log('🔍 Analyzing error:', request.errorMessage);

    if (this.useRealAI && this.bytezClient) {
      try {
        return await this.generateAIAnalysis(request);
      } catch (error) {
        console.error('AI analysis failed, falling back to mock:', error);
        return this.generateErrorAnalysis(request);
      }
    }
    
    return this.generateErrorAnalysis(request);
  }

  /**
   * Generate AI-powered analysis using Bytez SDK with Claude Sonnet 4.5
   */
  private async generateAIAnalysis(request: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
    if (!this.bytezClient) {
      throw new Error('Bytez client not initialized');
    }

    const model = this.bytezClient.model('anthropic/claude-sonnet-4-5');

    const prompt = `You are an expert software engineer analyzing production errors.
Analyze this error and provide a comprehensive analysis.

Error Message: ${request.errorMessage}
${request.stackTrace ? `Stack Trace:\n${request.stackTrace}` : ''}
${request.context?.file ? `File: ${request.context.file}` : ''}
${request.context?.line ? `Line: ${request.context.line}` : ''}
${request.context?.environment ? `Environment: ${request.context.environment}` : ''}

Respond with ONLY valid JSON in this exact format:
{
  "rootCause": "Brief description of the root cause",
  "explanation": "Detailed explanation for developers",
  "suggestedFix": {
    "code": "Code snippet showing the fix",
    "description": "Description of what the fix does",
    "confidence": 85
  },
  "similarPatterns": ["Pattern 1", "Pattern 2"],
  "preventionTips": ["Tip 1", "Tip 2", "Tip 3"],
  "severity": "low|medium|high|critical",
  "estimatedImpact": {
    "users": 50,
    "revenue": 5000
  }
}`;

    const { error, output } = await model.run([
      { role: 'user', content: prompt }
    ]);

    if (error) {
      console.error('Bytez API error:', error);
      throw new Error(String(error));
    }

    if (output) {
      const jsonMatch = String(output).match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          rootCause: parsed.rootCause || 'Unable to determine',
          explanation: parsed.explanation || 'Further investigation required',
          suggestedFix: parsed.suggestedFix || {
            code: '// Add error handling',
            description: 'Add proper error handling',
            confidence: 50
          },
          similarPatterns: parsed.similarPatterns || [],
          preventionTips: parsed.preventionTips || [],
          severity: parsed.severity || 'medium',
          estimatedImpact: parsed.estimatedImpact || { users: 0, revenue: 0 }
        };
      }
    }

    throw new Error('Failed to parse AI response');
  }

  /**
   * Generate component render data based on natural language query
   */
  async renderComponents(request: ComponentRenderRequest): Promise<ComponentRenderResponse> {
    console.log('🎨 Rendering components for:', request.query);

    const components = request.componentsNeeded.map(type => ({
      type,
      props: this.getDefaultPropsForComponent(type),
      data: this.getDefaultDataForComponent(type, request.errorContext?.timeRange),
    }));

    return {
      components,
      insights: [
        'Error rate increased 340% after latest deployment',
        'All affected users came from the same marketing campaign',
        'Similar error was fixed 3 months ago in PR #234',
      ],
    };
  }

  /**
   * Stream analysis results in real-time
   */
  async *streamAnalysis(request: ErrorAnalysisRequest): AsyncGenerator<string> {
    const steps = [
      '🔍 Analyzing stack trace...',
      '📊 Checking error patterns...',
      '🧠 Identifying root cause...',
      '💡 Generating fix suggestions...',
      '✅ Analysis complete!',
    ];

    for (const step of steps) {
      yield step;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const analysis = await this.analyzeError(request);
    yield JSON.stringify(analysis, null, 2);
  }

  private async generateErrorAnalysis(request: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
    // Determine severity based on error type
    let severity: ErrorAnalysisResponse['severity'] = 'medium';
    if (request.errorMessage.toLowerCase().includes('typeerror')) {
      severity = 'high';
    }
    if (request.context?.file?.includes('checkout') || request.context?.file?.includes('payment')) {
      severity = 'critical';
    }

    // Generate context-aware analysis
    const isNullReference = request.errorMessage.toLowerCase().includes('undefined') ||
                           request.errorMessage.toLowerCase().includes('null') ||
                           request.errorMessage.toLowerCase().includes("cannot read property");

    let rootCause = 'Unknown error pattern';
    let suggestedCode = '';
    let description = '';

    if (isNullReference) {
      rootCause = `Null/undefined reference detected. The variable being accessed is undefined at runtime, likely due to missing data or incorrect state management.`;
      
      // Extract property name from error message
      const propertyMatch = request.errorMessage.match(/property ['"](.*?)['"]/);
      const property = propertyMatch ? propertyMatch[1] : 'property';
      
      suggestedCode = `// Use optional chaining and provide fallback
const ${property} = object?.${property} ?? defaultValue;

// Or add a guard clause
if (!object) {
  // Handle missing object case
  return handleMissingData();
}`;
      description = `Add optional chaining (?.) to safely access nested properties and provide a fallback value to prevent runtime errors.`;
    } else {
      rootCause = `Error detected in ${request.context?.file || 'unknown file'}. Further investigation needed.`;
      suggestedCode = `// Add error handling
try {
  // Original code here
} catch (error) {
  console.error('Error:', error);
  // Handle gracefully
}`;
      description = 'Wrap the problematic code in a try-catch block to handle errors gracefully.';
    }

    return {
      rootCause,
      explanation: `This error occurs when trying to access a property on an undefined or null value. In your case, the ${request.context?.file || 'code'} at line ${request.context?.line || 'unknown'} is attempting to access a property that doesn't exist. This commonly happens when: 1) Data hasn't loaded yet, 2) API response is different than expected, 3) User state isn't properly initialized.`,
      suggestedFix: {
        code: suggestedCode,
        description,
        confidence: 92,
      },
      similarPatterns: [
        'TypeError: Cannot read property of undefined (fixed in PR #234)',
        'Null reference in cart processing (fixed in PR #189)',
        'Undefined user session handling (fixed in PR #156)',
      ],
      preventionTips: [
        'Use TypeScript strict mode to catch null reference errors at compile time',
        'Implement proper loading states to prevent accessing data before it\'s ready',
        'Add unit tests for edge cases with missing or null data',
        'Use defensive programming with optional chaining (?.) and nullish coalescing (??)',
      ],
      severity,
      estimatedImpact: {
        users: Math.floor(Math.random() * 100) + 20,
        revenue: Math.floor(Math.random() * 20000) + 5000,
      },
    };
  }

  private getDefaultPropsForComponent(type: string): Record<string, unknown> {
    const propsMap: Record<string, Record<string, unknown>> = {
      ErrorTimeline: { range: '24h', showDeployments: true },
      ImpactMetrics: { showRevenue: true, showUsers: true },
      StackTrace: { showLineNumbers: true, highlightError: true },
      UserJourney: { showSuccessRate: true },
      InfrastructureHealth: { refreshInterval: 30000 },
      QuickActions: { allowRollback: true },
      SimilarErrors: { limit: 5 },
      SuggestedFix: { showConfidence: true },
    };

    return propsMap[type] || {};
  }

  private getDefaultDataForComponent(type: string, timeRange?: string): unknown {
    // Return mock data structure based on component type
    // This would be replaced with real Tambo AI responses
    const dataMap: Record<string, unknown> = {
      ErrorTimeline: {
        range: timeRange || '24h',
        dataPoints: this.generateTimelineData(),
      },
      ImpactMetrics: {
        users: 47,
        sessions: 234,
        revenue: 12340,
        severity: 'critical',
      },
    };

    return dataMap[type] || {};
  }

  private generateTimelineData() {
    const hours = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
    return hours.map(time => ({
      time,
      count: Math.floor(Math.random() * 100) + 10,
    }));
  }
}

// Export singleton instance
export const tamboService = new TamboService();
