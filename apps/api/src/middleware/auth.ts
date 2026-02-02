/**
 * Authentication Middleware
 * 
 * JWT-based authentication with session management.
 */

import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import * as jose from 'jose';
import { prisma, UserRole } from '@eduforge/database';

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);
const JWT_ISSUER = 'eduforge';
const JWT_AUDIENCE = 'eduforge-api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Extend Hono context
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Generate JWT token
 */
export async function generateToken(user: AuthUser): Promise<string> {
  const token = await new jose.SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Authentication middleware
 */
export async function authMiddleware(c: Context, next: Next) {
  // Try to get token from Authorization header
  let token = c.req.header('Authorization')?.replace('Bearer ', '');

  // Fall back to cookie
  if (!token) {
    token = getCookie(c, 'eduforge_token');
  }

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const user = await verifyToken(token);

  if (!user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Verify user still exists and is active
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (!dbUser) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Set user in context
  c.set('user', user);

  await next();
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!roles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
}

/**
 * Optional auth middleware (doesn't require auth but sets user if present)
 */
export async function optionalAuth(c: Context, next: Next) {
  let token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    token = getCookie(c, 'eduforge_token');
  }

  if (token) {
    const user = await verifyToken(token);
    if (user) {
      c.set('user', user);
    }
  }

  await next();
}
