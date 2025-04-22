import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing courseId in query parameters" },
        { status: 400 }
      );
    }

    const lessonsResult = await query(
      `SELECT lesson_id, course_id, lesson_name
       FROM lessons
       WHERE course_id = $1
       ORDER BY lesson_id ASC`,
      [courseId]
    );

    return NextResponse.json({ lessons: lessonsResult.rows });
  } catch (error) {
    console.error("Error getting lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
