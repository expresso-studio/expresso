import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId, lessonId } = await request.json();

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: "Missing userId or lessonId in request body" },
        { status: 400 }
      );
    }

    const insertResult = await query(
      `INSERT INTO progress (lesson_id, user_id)
       VALUES ($1, $2)
       RETURNING progress_id`,
      [lessonId, userId]
    );

    const progressId = insertResult.rows[0]?.progress_id;

    return NextResponse.json({
      success: true,
      progressId,
      message: "Lesson marked as completed.",
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson as completed" },
      { status: 500 }
    );
  }
}
