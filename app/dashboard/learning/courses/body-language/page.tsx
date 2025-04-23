"use client";

import * as React from "react";
import { CourseNames } from "@/lib/constants";
import CourseFormat from "../../course-format";
import { CourseStatus, CourseType } from "@/lib/types";
import { Courses } from "@/lib/constants";
import { useAuthUtils } from "@/hooks/useAuthUtils";

const defaultCourse: CourseType =
  Courses.find((course) => course.name == CourseNames.BodyLanguage) ??
  Courses[0];

export default function Page() {
  const { user, isAuthenticated, isLoading, error, refreshToken } =
    useAuthUtils();

  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);

  const [loadingCourses, setLoadingCourses] = React.useState(true);
  const [course, setCourse] = React.useState<CourseType & CourseStatus>({
    ...defaultCourse,
    status: -1,
  });

  // Fetch course progress data from API
  React.useEffect(() => {
    async function fetchCourseProgress() {
      if (!user?.sub) return;

      try {
        setLoadingCourses(true);

        // Create a copy of courses to update
        const updatedCourses = [...Courses];

        // Fetch progress for each course
        const progressPromises = updatedCourses.map(async (course) => {
          const res = await fetch(
            `/api/course/progress?userId=${encodeURIComponent(
              user.sub ?? ""
            )}&courseId=${encodeURIComponent(course.id)}`,
            { cache: "no-store" }
          );

          if (!res.ok) {
            throw new Error(`Failed to fetch progress for course ${course.id}`);
          }

          const data = await res.json();
          return {
            ...course,
            status: data.progress || 0,
          };
        });

        // Wait for all progress fetches to complete
        const coursesWithProgressData = await Promise.all(progressPromises);

        const course: CourseType & CourseStatus = coursesWithProgressData.find(
          (course) => course.name == CourseNames.BodyLanguage
        ) ?? { ...defaultCourse, status: 0 };

        setCourse(course);
      } catch (err) {
        console.error("Error fetching course progress:", err);
      } finally {
        setLoadingCourses(false);
      }
    }

    if (isAuthenticated && !isLoading) {
      fetchCourseProgress();
    }
  }, [isAuthenticated, isLoading, user]);

  if (course == null) {
    return (
      <main className="w-full min-h-full flex items-center justify-center">
        <h1 className="text-4xl">Error: Could find course.</h1>
      </main>
    );
  }

  return <CourseFormat {...course} />;
}
