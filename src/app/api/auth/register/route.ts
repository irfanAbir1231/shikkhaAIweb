import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_BASE_URL}/student/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.success || !data.data?.access_token) {
      return NextResponse.json(
        { success: false, error: data.error?.message || 'Registration failed' },
        { status: res.status }
      );
    }

    const response = NextResponse.json({ success: true, data: data.data });
    response.cookies.set('token', data.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
