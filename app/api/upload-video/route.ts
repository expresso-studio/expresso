// app/api/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';
import { query } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // Get userId from the URL
    const url = new URL(request.url);
    const userId = url.searchParams.get("user");
    const title = url.searchParams.get("title") || "Untitled Presentation";
    
    if (!userId) {
      return NextResponse.json({ error: 'User id missing from query parameters' }, { status: 401 });
    }

    // Parse the form data
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }
    
    // Convert file to buffer
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    
    // Generate a unique filename
    const fileName = `${userId}-${Date.now()}-presentation-recording.mp4`;
    
    // Upload to S3
    const videoUrl = await uploadToS3(buffer, fileName, videoFile.type || 'video/mp4');
    // save to db
    const result = await query(
      'INSERT INTO presentations (user_id, title, video_url, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [userId, title, videoUrl]
    );
    
    const presentationId = result.rows[0].id;
    
    return NextResponse.json({ videoUrl, presentationId });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}

// Increase the body size limit for large video files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};