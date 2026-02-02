/**
 * Authentication Routes
 * 
 * Handles user registration, login, logout, and OAuth flows.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { setCookie, deleteCookie } from 'hono/cookie';
import { z } from 'zod';
import { prisma } from '@eduforge/database';
import { generateToken, verifyToken } from '../middleware/auth';

export const authRoutes = new Hono();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER']).default('STUDENT'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Simple password hashing (use bcrypt/argon2 in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.PASSWORD_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * POST /auth/signup - Register a new user
 */
authRoutes.post('/signup', zValidator('json', signupSchema), async (c) => {
  const { email, password, name, role } = c.req.valid('json');

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return c.json({ error: 'Email already registered' }, 400);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with profile based on role
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
      // Create role-specific profile
      ...(role === 'STUDENT' && {
        studentProfile: {
          create: {},
        },
      }),
      ...(role === 'PARENT' && {
        parentProfile: {
          create: {},
        },
      }),
      ...(role === 'TEACHER' && {
        teacherProfile: {
          create: {},
        },
      }),
      // Create free subscription
      subscription: {
        create: {
          tier: 'FREE',
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // Generate token
  const token = await generateToken(user);

  // Set cookie
  setCookie(c, 'eduforge_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return c.json({
    user,
    token,
  }, 201);
});

/**
 * POST /auth/login - Login user
 */
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  // Generate token
  const token = await generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  // Create session record
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: c.req.header('user-agent'),
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    },
  });

  // Set cookie
  setCookie(c, 'eduforge_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  });
});

/**
 * POST /auth/logout - Logout user
 */
authRoutes.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
    // Delete session
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  // Clear cookie
  deleteCookie(c, 'eduforge_token');

  return c.json({ success: true });
});

/**
 * GET /auth/me - Get current user
 */
authRoutes.get('/me', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const user = await verifyToken(token);

  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Get full user data
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      preferredLanguage: true,
      timezone: true,
      createdAt: true,
      subscription: {
        select: {
          tier: true,
          status: true,
          currentPeriodEnd: true,
        },
      },
      studentProfile: {
        select: {
          id: true,
          gradeLevel: true,
          learningStyle: true,
          nativeLanguage: true,
          specialNeeds: true,
          interests: true,
          dailyGoalMinutes: true,
        },
      },
      parentProfile: {
        select: {
          id: true,
        },
      },
      teacherProfile: {
        select: {
          id: true,
          department: true,
        },
      },
    },
  });

  if (!fullUser) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user: fullUser });
});

/**
 * POST /auth/refresh - Refresh token
 */
authRoutes.post('/refresh', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.json({ error: 'Token required' }, 400);
  }

  const user = await verifyToken(token);

  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Generate new token
  const newToken = await generateToken(user);

  // Update session
  await prisma.session.updateMany({
    where: { token },
    data: {
      token: newToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Set new cookie
  setCookie(c, 'eduforge_token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return c.json({ token: newToken });
});

/**
 * POST /auth/forgot-password - Request password reset
 */
authRoutes.post('/forgot-password', zValidator('json', z.object({
  email: z.string().email(),
})), async (c) => {
  const { email } = c.req.valid('json');

  // Find user (don't reveal if user exists)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (user) {
    // In production, send email with reset link
    // For now, just log
    console.log(`Password reset requested for ${email}`);
  }

  return c.json({ 
    message: 'If an account exists with this email, a password reset link will be sent.',
  });
});

/**
 * GET /auth/oauth/:provider - Initiate OAuth flow
 */
authRoutes.get('/oauth/:provider', async (c) => {
  const provider = c.req.param('provider');
  
  // Supported providers
  const providers = ['google', 'microsoft', 'clever'];
  
  if (!providers.includes(provider)) {
    return c.json({ error: 'Unsupported OAuth provider' }, 400);
  }

  // In production, redirect to OAuth provider
  // This is a placeholder
  return c.json({ 
    message: `OAuth flow for ${provider} not yet implemented`,
    redirectUrl: `https://oauth.${provider}.com/authorize`,
  });
});

/**
 * POST /auth/oauth/:provider/callback - Handle OAuth callback
 */
authRoutes.post('/oauth/:provider/callback', async (c) => {
  const provider = c.req.param('provider');
  const { code } = await c.req.json();

  if (!code) {
    return c.json({ error: 'Authorization code required' }, 400);
  }

  // In production, exchange code for tokens and create/login user
  return c.json({ 
    message: `OAuth callback for ${provider} not yet implemented`,
  });
});
