// app/api/upload-transcript/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, presentationId, transcript } = body;
    
    if (!userId || !presentationId || !transcript) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, presentationId, or transcript' 
      }, { status: 400 });
    }


      const insertResult = await query(
        'INSERT INTO transcripts (user_id, presentation_id, transcript_text) VALUES ($1, $2, $3) RETURNING id',
        [userId, presentationId, transcript]
      );
      const transcriptId = insertResult.rows[0].id;
    
    return NextResponse.json({ 
      success: true, 
      transcriptId, 
      message: 'Transcript saved successfully' 
    });
  } catch (error) {
    console.error('Failed to save transcript:', error);
    return NextResponse.json({ 
      error: 'Failed to save transcript' 
    }, { status: 500 });
  }
}