import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { sessionId, seconds } = await request.json();

    if (!sessionId || !seconds) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add your API call here using the same pattern as in your start API
    const response = await fetch(`${process.env.API_BASE_URL}/sessions/${sessionId}/extend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({ seconds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, error: errorData.message || 'Failed to extend session' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, session: data.session });

  } catch (error) {
    console.error('Error extending session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
