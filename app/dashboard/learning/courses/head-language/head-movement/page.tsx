import * as React from "react";
import {
  CourseNames,
  CourseStatuses,
  LessonNames,
  LessonStatuses,
  MetricNames,
} from "@/lib/constants";
import {
  CourseStatus,
  CourseType,
  LessonStatus,
  LessonType,
} from "@/lib/types";
import { Courses } from "@/lib/constants";
import LessonFormat from "../../../lesson-format";
import EvaluateButton from "@/components/evaluate-button";

export default function Page() {
  // TODO(casey): replace with actual status
  const course: (CourseType & CourseStatus) | undefined = Courses.map(
    (course) => {
      const matchingCourse = CourseStatuses.find(
        (courseStatus) => courseStatus.name === course.name
      );

      if (matchingCourse) {
        return { ...course, ...matchingCourse };
      }

      return { ...course, status: 0 };
    }
  ).find((course) => course.name == CourseNames.HeadLanguage);

  // TODO(casey): replace with actual status
  const lesson: (LessonType & LessonStatus) | undefined = course?.lessons
    .map((lesson) => {
      const matchingLesson = LessonStatuses.find(
        (lessonStatus) => lessonStatus.name === lesson.name
      );

      if (matchingLesson) {
        return { ...lesson, ...matchingLesson };
      }

      return { ...lesson, status: false };
    })
    .find((lesson) => lesson.name == LessonNames.HeadMovement);

  if (course == null || lesson == null) {
    return (
      <main className="w-full min-h-full">
        <h1 className="text-4xl">Error: Could find lesson.</h1>
      </main>
    );
  }

  return (
    <LessonFormat {...lesson} courseName={course.name} color={course.color}>
      <p>{`TODO`}</p>

      <div className="w-full flex items-center justify-center pb-16">
        <EvaluateButton
          enabledParams={[MetricNames.HeadMovement]}
          lessonId={lesson.id}
        />
      </div>
    </LessonFormat>
  );
}
