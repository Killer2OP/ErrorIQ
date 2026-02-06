/**
 * Error Routes - CRUD endpoints for error management
 */

import { Router, Request, Response } from 'express';
import { errorService } from '../services/error.service.js';

const router = Router();

/**
 * POST /api/errors - Submit a new error (from SDK or direct API call)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      message, stack, file, line, column, severity, 
      environment, browser, os, metadata,
      // SDK fields
      projectId, url, user, device
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Error message is required' });
    }

    // Merge SDK metadata
    const fullMetadata = {
      ...metadata,
      user,
      device,
    };

    const { error, isNew } = await errorService.createError({
      message,
      stack: stack || '',
      file: file || 'unknown',
      line: line || 0,
      column,
      severity: severity || 'medium',
      status: 'new',
      affectedUsers: 1,
      sessions: 1,
      environment: environment || 'production',
      browser: browser || device?.browser,
      os: os || device?.platform,
      metadata: fullMetadata,
      projectId,
      url,
    });

    // Emit WebSocket event for real-time updates
    const { broadcastError } = await import('../index.js');
    broadcastError(isNew ? 'new_error' : 'error_updated', error);

    res.status(isNew ? 201 : 200).json({
      ...error,
      isNew,
      fingerprint: error.fingerprint,
    });
  } catch (error) {
    console.error('Error creating error:', error);
    res.status(500).json({ error: 'Failed to create error' });
  }
});

/**
 * GET /api/errors - List errors with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { severity, status, file, search, limit = '50', skip = '0' } = req.query;

    const errors = await errorService.getErrors(
      {
        severity: severity as string,
        status: status as string,
        file: file as string,
        search: search as string,
      },
      parseInt(limit as string),
      parseInt(skip as string)
    );

    res.json({ errors, count: errors.length });
  } catch (error) {
    console.error('Error fetching errors:', error);
    res.status(500).json({ error: 'Failed to fetch errors' });
  }
});

/**
 * GET /api/errors/stats - Get error statistics
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await errorService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/errors/timeline/:range - Get timeline data for charts
 */
router.get('/timeline/:range', async (req: Request, res: Response) => {
  try {
    const { range } = req.params;
    const validRanges = ['1h', '24h', '7d', '30d'];
    const rangeStr = String(range);

    if (!validRanges.includes(rangeStr)) {
      return res.status(400).json({ 
        error: 'Invalid range. Use: 1h, 24h, 7d, or 30d' 
      });
    }

    const timelineData = await errorService.getTimeline(rangeStr);
    res.json(timelineData);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

/**
 * GET /api/errors/similar/:message - Find similar errors
 */
router.get('/similar/:message', async (req: Request, res: Response) => {
  try {
    const { message } = req.params;
    const { limit = '5' } = req.query;

    const similar = await errorService.getSimilarErrors(
      decodeURIComponent(String(message)),
      parseInt(String(limit))
    );

    res.json({ errors: similar });
  } catch (error) {
    console.error('Error finding similar errors:', error);
    res.status(500).json({ error: 'Failed to find similar errors' });
  }
});

/**
 * GET /api/errors/:id - Get a specific error
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const error = await errorService.getErrorById(String(id));

    if (!error) {
      return res.status(404).json({ error: 'Error not found' });
    }

    res.json(error);
  } catch (error) {
    console.error('Error fetching error:', error);
    res.status(500).json({ error: 'Failed to fetch error' });
  }
});

/**
 * PATCH /api/errors/:id/status - Update error status
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'acknowledged', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Use: new, acknowledged, or resolved' 
      });
    }

    const updatedError = await errorService.updateErrorStatus(String(id), status);

    if (!updatedError) {
      return res.status(404).json({ error: 'Error not found' });
    }

    // Emit WebSocket event
    const { broadcastError } = await import('../index.js');
    broadcastError('error_updated', updatedError);

    res.json(updatedError);
  } catch (error) {
    console.error('Error updating error status:', error);
    res.status(500).json({ error: 'Failed to update error status' });
  }
});

export default router;
