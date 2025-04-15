// app/api/course/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const courseId = url.searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Missing userId or courseId in query parameters' },
        { status: 400 }
      );
    }

    // total lessons for the course
    const totalLessonsResult = await query(
      `SELECT COUNT(*) AS total 
       FROM lessons 
       WHERE course_id = $1`,
      [courseId]
    );
    const totalLessons = parseInt(totalLessonsResult.rows[0].total, 10);

    if (totalLessons === 0) {
      // No lessons in this course => 0% progress
      return NextResponse.json({ progress: 0 });
    }

    // number of lessons user has completed
    const completedLessonsResult = await query(
      `SELECT COUNT(*) AS completed
       FROM progress p
       JOIN lessons l ON p.lesson_id = l.lesson_id
       WHERE l.course_id = $1
         AND p.user_id = $2`,
      [courseId, userId]
    );
    const completed = parseInt(completedLessonsResult.rows[0].completed, 10);

    // calculate progress (percentage)
    const progress = (completed / totalLessons) * 100;

    return NextResponse.json({
      totalLessons,
      completed,
      progress,
    });
  } catch (error) {
    console.error('Error getting course progress:', error);
    return NextResponse.json(
      { error: 'Failed to get course progress' },
      { status: 500 }
    );
  }
}
