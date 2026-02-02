import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

async function proxyRequest(
  request: NextRequest,
  slug: string[],
  method: string
) {
  const path = slug.join('/');
  const url = `${API_URL}/teacher/${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Forward auth header if present
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  // Forward cookies for session auth
  const cookies = request.headers.get('Cookie');
  if (cookies) {
    headers['Cookie'] = cookies;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  // Include body for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const body = await request.json();
      options.body = JSON.stringify(body);
    } catch {
      // No body or invalid JSON - that's okay
    }
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Teacher API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to API server' },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxyRequest(request, slug, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxyRequest(request, slug, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxyRequest(request, slug, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxyRequest(request, slug, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxyRequest(request, slug, 'PATCH');
}
