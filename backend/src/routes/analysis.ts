/**
 * Analysis Routes - AI-powered error analysis endpoints
 */

import { Router, Request, Response } from 'express';
import { tamboService, ErrorAnalysisRequest } from '../services/tambo.service.js';

const router = Router();

/**
 * POST /api/analysis/error - Analyze an error with AI
 */
router.post('/error', async (req: Request, res: Response) => {
  try {
    const { errorMessage, stackTrace, context } = req.body as ErrorAnalysisRequest;

    if (!errorMessage) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    const analysis = await tamboService.analyzeError({
      errorMessage,
      stackTrace: stackTrace || '',
      context,
    });

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing error:', error);
    res.status(500).json({ error: 'Failed to analyze error' });
  }
});

/**
 * POST /api/analysis/components - Request component rendering data
 */
router.post('/components', async (req: Request, res: Response) => {
  try {
    const { query, componentsNeeded, errorContext } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await tamboService.renderComponents({
      query,
      componentsNeeded: componentsNeeded || [],
      errorContext,
    });

    res.json(result);
  } catch (error) {
    console.error('Error rendering components:', error);
    res.status(500).json({ error: 'Failed to render components' });
  }
});

/**
 * POST /api/analysis/stream - Stream analysis results (Server-Sent Events)
 */
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { errorMessage, stackTrace, context } = req.body as ErrorAnalysisRequest;

    if (!errorMessage) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');

    // Stream analysis results
    for await (const chunk of tamboService.streamAnalysis({
      errorMessage,
      stackTrace: stackTrace || '',
      context,
    })) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: {"done": true}\n\n');
    res.end();
  } catch (error) {
    console.error('Error streaming analysis:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/analysis/chat - Natural language chat for error analysis
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, errorContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Parse the user's natural language query to determine what they want
    const lowerMessage = message.toLowerCase();
    
    let response: {
      type: string;
      message: string;
      data?: unknown;
      actions?: string[];
    };

    if (lowerMessage.includes('analyze') || lowerMessage.includes('what') || lowerMessage.includes('why')) {
      // User wants error analysis
      const analysis = await tamboService.analyzeError({
        errorMessage: errorContext?.message || message,
        stackTrace: errorContext?.stack || '',
        context: errorContext,
      });

      response = {
        type: 'analysis',
        message: `I've analyzed the error. The root cause is: ${analysis.rootCause}`,
        data: analysis,
        actions: ['Apply suggested fix', 'View similar errors', 'Create ticket'],
      };
    } else if (lowerMessage.includes('fix') || lowerMessage.includes('solve') || lowerMessage.includes('resolve')) {
      // User wants a fix
      const analysis = await tamboService.analyzeError({
        errorMessage: errorContext?.message || message,
        stackTrace: errorContext?.stack || '',
        context: errorContext,
      });

      response = {
        type: 'fix',
        message: `Here's the suggested fix:\n\n\`\`\`javascript\n${analysis.suggestedFix.code}\n\`\`\`\n\n${analysis.suggestedFix.description}`,
        data: analysis.suggestedFix,
        actions: ['Apply fix', 'See alternative fixes', 'Explain more'],
      };
    } else if (lowerMessage.includes('impact') || lowerMessage.includes('users') || lowerMessage.includes('affected')) {
      // User wants impact information
      response = {
        type: 'impact',
        message: `This error has affected approximately 47 users and 234 sessions. Estimated revenue at risk: $12,340. The error is concentrated in the US-East region (96%).`,
        data: {
          users: 47,
          sessions: 234,
          revenue: 12340,
          regions: ['US-East (96%)', 'US-West (4%)'],
        },
        actions: ['View user journey', 'Send notifications', 'Create incident'],
      };
    } else if (lowerMessage.includes('timeline') || lowerMessage.includes('when') || lowerMessage.includes('history')) {
      // User wants timeline information
      response = {
        type: 'timeline',
        message: `The error was first detected 23 minutes ago at 12:34 PM. Error rate peaked at 12:45 PM with 120 errors. There were 2 deployments in the last 24 hours that might be related.`,
        data: {
          firstDetected: '12:34 PM',
          peakTime: '12:45 PM',
          peakCount: 120,
          deployments: ['v3.2.0 at 12pm', 'Config change at 6pm'],
        },
        actions: ['View full timeline', 'Compare with previous', 'Rollback'],
      };
    } else {
      // Generic response
      response = {
        type: 'general',
        message: `I can help you with:\n• Analyzing errors and finding root causes\n• Suggesting fixes for issues\n• Understanding impact on users\n• Viewing error timelines and patterns\n\nWhat would you like to know?`,
        actions: ['Analyze current error', 'Show error timeline', 'Check infrastructure'],
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
