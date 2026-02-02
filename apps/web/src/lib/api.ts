const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE}/api/v1`;

export async function proxyToBackend(
  path: string,
  request: Request
): Promise<Response> {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(cleanPath, API_URL + '/');
  
  // Copy search params
  const originalUrl = new URL(request.url);
  originalUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  // Forward headers
  const headers = new Headers();
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }
  headers.set('Content-Type', 'application/json');

  // Build request options
  const options: RequestInit = {
    method: request.method,
    headers,
  };

  // Add body for non-GET requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const body = await request.json();
      options.body = JSON.stringify(body);
    } catch {
      // No body or invalid JSON
    }
  }

  try {
    const response = await fetch(url.toString(), options);
    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Backend proxy error:', error);
    return Response.json(
      { error: 'Failed to connect to backend' },
      { status: 502 }
    );
  }
}

export { API_URL, API_BASE };
