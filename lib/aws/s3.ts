// lib/aws/s3.ts
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./config";

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "expresso-user-data";

/**
 * Uploads a file to S3 and returns the object URL
 *
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name to give the file in S3
 * @param contentType - The MIME type of the file
 * @returns The URL of the uploaded file
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));

    // Return the full URL but don't make it publicly accessible
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(
      `Failed to upload file to S3: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Generates a pre-signed URL for a file in S3
 *
 * @param key - The S3 object key
 * @param expiresIn - How long the URL is valid for (in seconds)
 * @returns A pre-signed URL to access the file
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw new Error(
      `Failed to generate pre-signed URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extracts the S3 key from a full S3 URL
 *
 * @param url - The full S3 URL
 * @returns The S3 object key
 */
export function extractKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Extract the path without the leading slash
    const key = urlObj.pathname.substring(1);
    return key;
  } catch (error) {
    console.error("Error extracting key from URL:", error);
    throw new Error(`Invalid S3 URL format: ${url}`);
  }
}
