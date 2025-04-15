// app/api/sign-s3/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { query } from '@/lib/db';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User id missing' }, { status: 401 });
    }
    const finalTitle = title?.trim() || 'Untitled Presentation';
    const videoKey = `${userId}-${Date.now()}-presentation-recording.mp4`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: videoKey,
      ContentType: 'video/mp4',
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    const result = await query(
      'INSERT INTO presentations (user_id, title, video_url, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
      [userId, finalTitle, videoKey]
    );
    const presentationId = result.rows[0].id;

    // Return the pre-signed URL, video key, and the presentationID.
    return NextResponse.json({ signedUrl, videoKey, presentationId });
  } catch (error) {
    console.error("Error generating signed URL and registering presentation:", error);
    return NextResponse.json(
      { error: "Failed to generate pre-signed URL and register presentation" },
      { status: 500 }
    );
  }
}
