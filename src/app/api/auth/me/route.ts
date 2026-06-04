import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Decode JWT to get student id
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const studentId = payload.sub;

    const res = await fetch(`${API_BASE_URL}/student/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error?.message || 'Failed to fetch user' },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
