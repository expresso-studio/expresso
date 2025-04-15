// app/api/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/aws/s3';
import { query } from '@/lib/db';

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
    
    console.log(`Uploaded video size: ${videoFile.size} bytes`);

    // Generate a unique filename
    const videoKey = `${userId}-${Date.now()}-presentation-recording.mp4`;
    
    // Upload to S3
    await uploadToS3(buffer, videoKey, videoFile.type || 'video/mp4');
    
    // Save to db
    const result = await query(
      'INSERT INTO presentations (user_id, title, video_url, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [userId, title, videoKey]
    );
    
    const presentationId = result.rows[0].id;
    
    return NextResponse.json({ videoKey, presentationId });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}

// Increase the body size limit for large video files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};