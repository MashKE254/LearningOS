/**
 * EduForge API Server
 * 
 * Main entry point for the EduForge backend API.
 * Built with Hono for performance and simplicity.
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

// Import routes
import { authRoutes } from './routes/auth';
import { studentRoutes } from './routes/student';
import { tutorRoutes } from './routes/tutor';
import { curriculumRoutes } from './routes/curriculum';
import { parentRoutes } from './routes/parent';
import { teacherRoutes } from './routes/teacher';
import { adminRoutes } from './routes/admin';
import { webhookRoutes } from './routes/webhooks';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limit';

// Create app
const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API version prefix
const api = new Hono();

// Public routes (no auth required)
api.route('/auth', authRoutes);
api.route('/webhooks', webhookRoutes);

// Protected routes (auth required)
api.use('/student/*', authMiddleware);
api.use('/tutor/*', authMiddleware);
api.use('/curriculum/*', authMiddleware);
api.use('/parent/*', authMiddleware);
api.use('/teacher/*', authMiddleware);
api.use('/admin/*', authMiddleware);

// Apply rate limiting to tutor routes (AI calls are expensive)
api.use('/tutor/*', rateLimiter({ 
  windowMs: 60000, // 1 minute
  maxRequests: 30, // 30 requests per minute
}));

// Mount protected routes
api.route('/student', studentRoutes);
api.route('/tutor', tutorRoutes);
api.route('/curriculum', curriculumRoutes);
api.route('/parent', parentRoutes);
api.route('/teacher', teacherRoutes);
api.route('/admin', adminRoutes);

// Mount API under /api/v1
app.route('/api/v1', api);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  }, 500);
});

// Start server
const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 EduForge API starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ EduForge API running at http://localhost:${port}`);

export default app;
