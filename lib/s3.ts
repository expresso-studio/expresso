import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  await s3Client.send(new PutObjectCommand(params));
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
