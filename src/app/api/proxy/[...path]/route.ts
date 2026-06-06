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
  try {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname.replace('/api/proxy', '');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${API_BASE_URL}${pathname}${searchParams ? '?' + searchParams : ''}`;

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

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    const data = await res.json().catch(() => null);

    if (!data) {
      return new NextResponse(null, { status: res.status });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Proxy error' },
      { status: 500 }
    );
  }
}
