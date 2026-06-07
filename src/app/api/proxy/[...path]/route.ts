import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export async function GET(request: NextRequest) {
  return handleProxy(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleProxy(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleProxy(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return handleProxy(request, 'PATCH');
}

async function handleProxy(request: NextRequest, method: string) {
  let upstreamUrl: string | undefined;

  try {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname.replace('/api/proxy', '');
    const searchParams = request.nextUrl.searchParams.toString();
    upstreamUrl = `${API_BASE_URL}${pathname}${searchParams ? '?' + searchParams : ''}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let body: BodyInit | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          const jsonBody = await request.json();
          body = JSON.stringify(jsonBody);
          headers['Content-Type'] = 'application/json';
        } catch {
          // Empty or unreadable JSON body — forward without body
          body = undefined;
        }
      } else if (contentType?.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        const textBody = await request.text();
        body = textBody || undefined;
      }
    }

    const res = await fetch(upstreamUrl, {
      method,
      headers,
      body,
    });

    // Always return JSON to the client so fetch().json() never explodes
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (data && typeof data === 'object') {
      return NextResponse.json(data, { status: res.status });
    }

    // Upstream returned a non-JSON body (HTML error page, empty body, etc.)
    // Log first 800 chars of body for debugging (visible in Vercel logs)
    const preview = text.slice(0, 800).replace(/\s+/g, ' ').trim();
    console.error('[proxy] Upstream non-JSON response:', {
      url: upstreamUrl,
      status: res.status,
      statusText: res.statusText,
      bodyPreview: preview,
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPSTREAM_ERROR',
          message: `Upstream returned ${res.status} ${res.statusText}${text ? ' (non-JSON response)' : ' (empty response)'}`,
          debug: preview || undefined,
        },
      },
      { status: res.status >= 200 && res.status < 300 ? 502 : res.status }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy error';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: `Could not reach upstream API${upstreamUrl ? ` at ${upstreamUrl}` : ''}: ${message}`,
        },
      },
      { status: 502 }
    );
  }
}
