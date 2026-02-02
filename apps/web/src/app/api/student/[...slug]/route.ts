import { proxyToBackend } from '@/lib/api';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  return proxyToBackend(path, request);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  return proxyToBackend(path, request);
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  return proxyToBackend(path, request);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  return proxyToBackend(path, request);
}
