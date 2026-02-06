/**
 * ErrorIQ Backend Server
 * Express + WebSocket server for AI-powered error analysis
 */

// Force Node to use Google + Cloudflare DNS instead of ISP DNS
// This fixes MongoDB SRV lookup failures with Reliance/other ISPs
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// Import services
import { errorService } from './services/error.service.js';

// Import routes
import errorsRouter from './routes/errors.js';
import analysisRouter from './routes/analysis.js';
import actionsRouter from './routes/actions.js';
import mcpRouter from './routes/mcp.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================
// Middleware
// ============================================

// CORS configuration
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================
// API Routes
// ============================================

app.use('/api/errors', errorsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/mcp', mcpRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      ai: 'ready',
    },
  });
});

// API info endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'ErrorIQ API',
    version: '1.0.0',
    endpoints: {
      errors: '/api/errors',
      analysis: '/api/analysis',
      actions: '/api/actions',
    },
    documentation: 'https://github.com/your-org/erroriq#api-docs',
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ============================================
// HTTP + WebSocket Server
// ============================================

const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

// Track connected clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log('🔌 WebSocket client connected');
  clients.add(ws);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to ErrorIQ real-time updates',
    timestamp: new Date().toISOString(),
  }));

  // Handle incoming messages
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📥 WebSocket message:', message);

      // Handle different message types
      switch (message.type) {
        case 'subscribe':
          // Client wants to subscribe to specific error/channel
          console.log('Client subscribed to:', message.channel);
          break;
        case 'unsubscribe':
          console.log('Client unsubscribed from:', message.channel);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast function for sending updates to all clients
export function broadcastError(eventType: string, data: unknown): void {
  const message = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// ============================================
// Server Startup
// ============================================

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await errorService.connect();

    // Start listening
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 ErrorIQ Backend Server                                ║
║                                                            ║
║   HTTP:      http://localhost:${PORT}                        ║
║   WebSocket: ws://localhost:${PORT}/ws                       ║
║   Health:    http://localhost:${PORT}/health                 ║
║                                                            ║
║   Frontend:  ${FRONTEND_URL}                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await errorService.disconnect();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down...');
  await errorService.disconnect();
  server.close(() => {
    process.exit(0);
  });
});

// Start the server
startServer();
