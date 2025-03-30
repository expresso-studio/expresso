// app/api/transcripts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get userId from the URL
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    // Fetch transcripts with presentation title
    const result = await query(
      `SELECT t.id, t.presentation_id, t.transcript_text, t.created_at, 
              p.title as presentation_title, p.video_url
       FROM transcripts t
       JOIN presentations p ON t.presentation_id = p.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    
    return NextResponse.json({ 
      transcripts: result.rows 
    });
  } catch (error) {
    console.error('Failed to fetch transcripts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch transcripts' 
    }, { status: 500 });
  }
}