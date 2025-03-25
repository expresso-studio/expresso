import { NextResponse } from 'next/server';
import { query } from "../../../../lib/db";

export async function GET() {
  try {
    const userId = 'auth0|67baac4182c20de0c41b0395';

    const results = await query(
      `SELECT * FROM (
        SELECT id, created_at, max_wpm, min_wpm, session_wpm
        FROM filler_stats
        WHERE user_id = $1 AND max_wpm IS NOT NULL AND min_wpm IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 10
      ) subquery 
      ORDER BY created_at ASC`, [userId]);

    return NextResponse.json({ fillerWords: results.rows }, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    } catch (error) {
    console.error('Error fetching WPM sessions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
