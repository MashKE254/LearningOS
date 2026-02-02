import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = `/parent/${params.slug.join('/')}`;
  return proxyToBackend(path, request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = `/parent/${params.slug.join('/')}`;
  return proxyToBackend(path, request);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = `/parent/${params.slug.join('/')}`;
  return proxyToBackend(path, request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const path = `/parent/${params.slug.join('/')}`;
  return proxyToBackend(path, request);
}
