// app/api/transcripts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get userId from the URL
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const id = url.searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required",
        },
        { status: 400 },
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          error: "Presentation ID is required",
        },
        { status: 400 },
      );
    }

    // Fetch transcript for given presentation ID
    const transcriptResult = await query(
      `SELECT 
                p.title AS title, 
                t.transcript_text
                FROM transcripts t
                JOIN presentations p ON t.presentation_id = p.id
                WHERE t.user_id = $1 AND t.presentation_id = $2
                LIMIT 1`,
      [userId, id],
    );

    const scriptResult = await query(
      `SELECT script_text from scripts 
            WHERE user_id = $1 and presentation_id = $2`,
      [userId, id],
    );

    return NextResponse.json({
      transcript: transcriptResult.rows,
      script: scriptResult.rows,
    });
  } catch (error) {
    console.error("Failed to fetch transcript and script:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transcript and script",
      },
      { status: 500 },
    );
  }
}
