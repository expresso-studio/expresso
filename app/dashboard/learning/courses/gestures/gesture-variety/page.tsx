import * as React from "react";
import {
  CourseNames,
  CourseStatuses,
  LessonNames,
  LessonStatuses,
} from "@/lib/constants";
import {
  CourseStatus,
  CourseType,
  LessonStatus,
  LessonType,
} from "@/lib/types";
import { Courses } from "@/lib/constants";
import LessonFormat from "../../../lesson-format";

export default function Page() {
  // TODO(casey): replace with actual status
  const course: (CourseType & CourseStatus) | undefined = Courses.map(
    (course) => {
      const matchingCourse = CourseStatuses.find(
        (courseStatus) => courseStatus.name === course.name,
      );

      if (matchingCourse) {
        return { ...course, ...matchingCourse };
      }

      return { ...course, status: 0 };
    },
  ).find((course) => course.name == CourseNames.Gestures);

  // TODO(casey): replace with actual status
  const lesson: (LessonType & LessonStatus) | undefined = course?.lessons
    .map((lesson) => {
      const matchingLesson = LessonStatuses.find(
        (lessonStatus) => lessonStatus.name === lesson.name,
      );

      if (matchingLesson) {
        return { ...lesson, ...matchingLesson };
      }

      return { ...lesson, status: false };
    })
    .find((lesson) => lesson.name == LessonNames.GestureVariety);

  if (course == null || lesson == null) {
    return (
      <main className="w-full min-h-full">
        <h1 className="text-4xl">Error: Could find lesson.</h1>
      </main>
    );
  }

  return (
    <LessonFormat {...lesson} courseName={course.name} color={course.color}>
      TODO: add lesson content
    </LessonFormat>
  );
}
