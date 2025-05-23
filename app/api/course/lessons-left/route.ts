import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const courseId = url.searchParams.get("courseId");

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Missing userId or courseId in query parameters" },
        { status: 400 }
      );
    }

    console.log("courseId ", courseId);
    console.log("userId ", userId);

    // Select all lessons for the course that are NOT in the user's progress table
    const lessonsLeftResult = await query(
      `SELECT l.lesson_id, l.lesson_name
       FROM lessons l
       JOIN progress p ON l.lesson_id = p.lesson_id
       WHERE l.course_id = $1
         AND p.user_id = $2
         AND l.course_id = $1`,
      [courseId, userId]
    );

    return NextResponse.json({ lessonsLeft: lessonsLeftResult.rows });
  } catch (error) {
    console.error("Error getting lessons left:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons left" },
      { status: 500 }
    );
  }
}
