// app/api/get-signed-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/aws/s3";

export async function GET(request: NextRequest) {
  try {
    // Extract videoKey and userId from the query parameters
    const url = new URL(request.url);
    const videoKey = url.searchParams.get("videoKey");
    const userId = url.searchParams.get("user");

    if (!videoKey) {
      return NextResponse.json(
        { error: "Video key is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Generate a pre-signed URL that expires in 3600 seconds (1 hour) using the object key
    const signedUrl = await getPresignedUrl(videoKey);

    // Return the signed URL
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate video URL" },
      { status: 500 }
    );
  }
}
