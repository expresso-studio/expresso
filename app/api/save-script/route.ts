// app/api/save-script/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, presentationId, script } = body;

    if (!userId || !presentationId || !script) {
      return NextResponse.json(
        { error: "Missing required fields: userId, presentationId, or script" },
        { status: 400 },
      );
    }

    // Insert the script into the scripts table
    const insertResult = await query(
      `INSERT INTO scripts (user_id, presentation_id, script_text)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, presentationId, script],
    );

    const scriptId = insertResult.rows[0].id;

    return NextResponse.json({
      success: true,
      scriptId,
      message: "Script saved successfully",
    });
  } catch (error) {
    console.error("Failed to save script:", error);
    return NextResponse.json(
      { error: "Failed to save script." },
      { status: 500 },
    );
  }
}
