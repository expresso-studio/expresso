import * as React from "react";
import { CourseNames, CourseStatuses } from "@/lib/constants";
import CourseFormat from "../../course-format";
import { CourseStatus, CourseType } from "@/lib/types";
import { Courses } from "@/lib/constants";

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
  ).find((course) => course.name == CourseNames.HandLanguage);

  if (course == null) {
    return (
      <main className="w-full min-h-full">
        <h1 className="text-4xl">Error: Could find course.</h1>
      </main>
    );
  }

  return <CourseFormat {...course} />;
}
