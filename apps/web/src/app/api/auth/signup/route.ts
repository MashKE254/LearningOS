import { NextRequest, NextResponse } from 'next/server';

// In-memory user storage (replace with database in production)
// Using a global to persist across requests in development
declare global {
  // eslint-disable-next-line no-var
  var users: Map<string, User> | undefined;
}

interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  createdAt: Date;
}

// Initialize users map
if (!global.users) {
  global.users = new Map();
}

const users = global.users;

// Simple hash function (use bcrypt in production)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

// Generate JWT-like token (use proper JWT in production)
function generateToken(userId: string): string {
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role = 'student' } = body;

    // Normalize role to lowercase
    const normalizedRole = (typeof role === 'string' ? role.toLowerCase() : 'student') as User['role'];

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const userId = crypto.randomUUID();
    const user: User = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash: simpleHash(password),
      name,
      role: normalizedRole,
      createdAt: new Date(),
    };

    users.set(userId, user);

    // Generate token
    const token = generateToken(userId);

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });

    // Set auth cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
