"use client";

import * as React from "react";
import { CourseNames, LessonNames, MetricNames } from "@/lib/constants";
import { LessonLeft, LessonType } from "@/lib/types";
import { Courses } from "@/lib/constants";
import LessonFormat from "../../../lesson-format";
import EvaluateButton from "@/components/evaluate-button";
import { useState } from "react";
import { useAuthUtils } from "@/hooks/useAuthUtils";

export default function Page() {
  const course = Courses.find((course) => course.name === CourseNames.Intro)!;

  const lessonObj = course.lessons.find(
    (lesson) => lesson.name === LessonNames.Basics
  )!;

  const [lessonData, setLessonData] = useState<
    LessonType & { status?: boolean }
  >(lessonObj);
  const { user, error, refreshToken } = useAuthUtils();

  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);

  React.useEffect(() => {
    const fetchLessonStatus = async () => {
      try {
        const selectedCourse = Courses.find(
          (course) => course.name === CourseNames.Intro
        )!;

        const lesson = selectedCourse.lessons.find(
          (lesson) => lesson.name === LessonNames.Basics
        )!;

        // Fetch lesson status from the API
        const response = await fetch(
          `/api/course/lessons-left?userId=${user?.sub}&courseId=${selectedCourse.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lesson status");
        }

        const data = await response.json();
        console.log(data);

        // Find this specific lesson's status
        const isLessonLeft = data.lessonsLeft.find(
          (leftLesson: LessonLeft) => leftLesson.lesson_name === lesson.name
        );

        // Set the lesson data with status
        setLessonData({
          ...lesson,
          status: isLessonLeft !== undefined,
        });
      } catch (error) {
        console.error("Error fetching lesson status:", error);
      }
    };

    if (user?.sub) {
      fetchLessonStatus();
    }
  }, [user?.sub]);

  if (!lessonData) {
    return (
      <main className="w-full min-h-full">
        <h1 className="text-4xl">Error: Could not find lesson.</h1>
      </main>
    );
  }

  return (
    <LessonFormat {...lessonData} courseName={course.name} color={course.color}>
      <p>{`TODO`}</p>
      <div className="w-full flex items-center justify-center pb-16">
        <EvaluateButton
          enabledParams={[
            MetricNames.Posture,
            MetricNames.EyeContact,
            MetricNames.OverallScore,
          ]}
          lessonId={lessonData.id}
        />
      </div>
    </LessonFormat>
  );
}
