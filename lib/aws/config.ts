// lib/aws/config.ts
import { S3Client } from "@aws-sdk/client-s3";

// single instance of the S3 client to be reused across the application
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
