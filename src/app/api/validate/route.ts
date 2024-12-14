import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const pool = createPool({
      connectionString: process.env.visionboard_PRISMA_URL
    });

    const { rows: [session] } = await pool.sql`
      SELECT * FROM timer_sessions 
      WHERE session_id = ${sessionId}
      AND is_active = true;
    `;

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 404 });
    }

    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json({ error: 'Failed to validate session' }, { status: 500 });
  }
}