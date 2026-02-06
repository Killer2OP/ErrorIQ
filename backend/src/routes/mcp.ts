/**
 * MCP Routes - Model Context Protocol API endpoints for error analysis
 */

import { Router, Request, Response } from 'express';
import { mcpService, ErrorContext } from '../services/mcp.service.js';
import { errorService } from '../services/error.service.js';

const router = Router();

/**
 * POST /api/mcp/analyze - Analyze an error with full MCP pipeline
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { errorMessage, stackTrace, file, line, metadata } = req.body;

    if (!errorMessage) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    const context: ErrorContext = {
      message: errorMessage,
      stack: stackTrace,
      file,
      line,
      metadata,
    };

    const analysis = await mcpService.analyzeError(context);
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('MCP analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze error' });
  }
});

/**
 * POST /api/mcp/identify - Quick error type identification
 */
router.post('/identify', async (req: Request, res: Response) => {
  try {
    const { errorMessage, stackTrace } = req.body;

    if (!errorMessage) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    const identification = mcpService.identifyErrorType(errorMessage, stackTrace);
    const severity = mcpService.calculateSeverity(identification.type, { message: errorMessage });
    const suggestedComponents = mcpService.getSuggestedComponents(identification.type);

    res.json({
      ...identification,
      severity,
      suggestedComponents,
    });
  } catch (error) {
    console.error('Error identification failed:', error);
    res.status(500).json({ error: 'Failed to identify error type' });
  }
});

/**
 * POST /api/mcp/components - Get recommended components for error type
 */
router.post('/components', async (req: Request, res: Response) => {
  try {
    const { errorType, errorMessage, stackTrace } = req.body;

    let type = errorType;
    
    // If no type provided, identify it
    if (!type && errorMessage) {
      const identified = mcpService.identifyErrorType(errorMessage, stackTrace);
      type = identified.type;
    }

    if (!type) {
      return res.status(400).json({ error: 'Error type or message is required' });
    }

    const components = mcpService.getSuggestedComponents(type);

    res.json({
      errorType: type,
      components,
      componentDetails: components.map(name => ({
        name,
        description: getComponentDescription(name),
      })),
    });
  } catch (error) {
    console.error('Component recommendation failed:', error);
    res.status(500).json({ error: 'Failed to get component recommendations' });
  }
});

/**
 * GET /api/mcp/similar/:errorId - Find similar errors
 */
router.get('/similar/:errorId', async (req: Request, res: Response) => {
  try {
    const errorId = req.params.errorId as string;

    // Get the error first
    const error = await errorService.getErrorById(errorId);
    
    if (!error) {
      return res.status(404).json({ error: 'Error not found' });
    }

    const similarErrors = await mcpService.findSimilarErrors(error.message);

    res.json({
      errorId,
      originalMessage: error.message,
      similarErrors,
      count: similarErrors.length,
    });
  } catch (error) {
    console.error('Similar errors lookup failed:', error);
    res.status(500).json({ error: 'Failed to find similar errors' });
  }
});

/**
 * POST /api/mcp/similar - Find similar errors by message
 */
router.post('/similar', async (req: Request, res: Response) => {
  try {
    const { errorMessage } = req.body;

    if (!errorMessage) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    const similarErrors = await mcpService.findSimilarErrors(errorMessage);

    res.json({
      originalMessage: errorMessage,
      similarErrors,
      count: similarErrors.length,
    });
  } catch (error) {
    console.error('Similar errors lookup failed:', error);
    res.status(500).json({ error: 'Failed to find similar errors' });
  }
});

/**
 * GET /api/mcp/impact/:errorId - Calculate impact metrics
 */
router.get('/impact/:errorId', async (req: Request, res: Response) => {
  try {
    const errorId = req.params.errorId as string;

    const impact = await mcpService.calculateImpact(errorId);

    res.json({
      errorId,
      impact,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Impact calculation failed:', error);
    res.status(500).json({ error: 'Failed to calculate impact' });
  }
});

/**
 * POST /api/mcp/stream - Stream analysis results (SSE)
 */
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { errorMessage, stackTrace, file, line } = req.body;

    if (!errorMessage) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');

    // Stream progress updates
    const steps = [
      { step: 'identify', message: '🔍 Identifying error type...' },
      { step: 'analyze', message: '🧠 Analyzing root cause...' },
      { step: 'similar', message: '🔎 Finding similar errors...' },
      { step: 'fix', message: '💡 Generating fix suggestion...' },
      { step: 'components', message: '🎨 Selecting UI components...' },
    ];

    for (const { step, message } of steps) {
      res.write(`data: ${JSON.stringify({ step, message })}\n\n`);
      await new Promise(r => setTimeout(r, 400));
    }

    // Final analysis
    const analysis = await mcpService.analyzeError({
      message: errorMessage,
      stack: stackTrace,
      file,
      line,
    });

    res.write(`data: ${JSON.stringify({ step: 'complete', analysis })}\n\n`);
    res.write('data: {"done": true}\n\n');
    res.end();
  } catch (error) {
    console.error('Stream analysis failed:', error);
    res.write(`data: ${JSON.stringify({ error: 'Analysis failed' })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/mcp/health - MCP service health check
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'MCP Server',
    version: '1.0.0',
    capabilities: [
      'error-analysis',
      'error-identification',
      'component-suggestion',
      'similar-error-search',
      'impact-calculation',
      'streaming-analysis',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Helper function
function getComponentDescription(name: string): string {
  const descriptions: Record<string, string> = {
    ErrorTimeline: 'Shows when errors occurred over time with deployment markers',
    ImpactMetrics: 'Displays affected users, revenue at risk, and severity',
    StackTrace: 'Annotated stack trace with AI-highlighted problematic lines',
    UserJourney: 'Visualizes the user path leading to the error',
    InfrastructureHealth: 'Backend services status dashboard',
    QuickActions: 'Actionable buttons for rollback, notify, create ticket',
    SimilarErrors: 'Table of past similar errors with resolutions',
    SuggestedFix: 'AI-generated code fix with confidence score',
    RelatedDocs: 'Relevant documentation links',
  };

  return descriptions[name] || 'Debug component';
}

export default router;
