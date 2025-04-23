"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { MetricType, ReportItemType } from "@/lib/types";
import ProtectedRoute from "@/components/protected-route";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import Recommendations from "./recommendations";
import { Courses, MetricNames, MetricNameToId } from "@/lib/constants";
import CourseList from "./course-list";
import { outfit } from "@/app/fonts";
import PracticeButton from "./practice-button";

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

  const [avgMetrics, setAvgMetrics] = React.useState<MetricType[]>([]);
  const [loadingReports, setLoadingReports] = React.useState(true);
  const [coursesWithStatus, setCoursesWithStatus] = React.useState(
    Courses.map((course) => ({ ...course, status: 0 }))
  );
  const [loadingCourses, setLoadingCourses] = React.useState(true);

  function calculateAvgMetrics(reports: ReportItemType[]) {
    // Create an object to hold the total sums and count for each category
    const categorySums: { [index: string]: number } = {};
    const categoryCounts: { [index: string]: number } = {};

    // Iterate over each report
    reports.forEach((report) => {
      // Iterate over each metric in the report
      report.metrics.forEach((metric) => {
        // If this category hasn't been encountered yet, initialize sums and counts
        if (!categorySums[metric.name]) {
          categorySums[metric.name] = 0;
          categoryCounts[metric.name] = 0;
        }

        // Add the metric value to the sum for this category
        categorySums[metric.name] += metric.score;
        categoryCounts[metric.name] += 1;
      });
    });

    // Now calculate the average for each category
    const avgScores = Object.keys(categorySums).map((category) => {
      return {
        metric_id: MetricNameToId[category as MetricNames],
        name: category as MetricNames,
        score: categorySums[category] / categoryCounts[category],
        evaluated_at: "n/a",
      };
    });

    console.log(avgScores);

    return avgScores;
  }

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
        console.log("coursesWithProgressData");
        console.log(coursesWithProgressData);
        setCoursesWithStatus(coursesWithProgressData);
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

  React.useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch(
          `/api/report?user=${encodeURIComponent(user?.sub || "")}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch report data");
        }
        const data = await res.json();
        setAvgMetrics(calculateAvgMetrics(data));
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoadingReports(false);
      }
    }
    if (isAuthenticated && !isLoading) {
      fetchReports();
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <ProtectedRoute>
      <PageFormat breadCrumbs={[{ name: "learning" }]}>
        <Heading1 id="learning">Learning</Heading1>
        <div className="w-full flex flex-col sm:flex-row gap-8">
          <div className="w-full">
            <Recommendations
              loading={loadingReports || loadingCourses}
              metrics={avgMetrics}
              courses={coursesWithStatus}
            />
          </div>
          <div className="min-w-[500px] flex flex-col gap-6">
            <PracticeButton />
            <div>
              <h3 className="text-xl font-bold pb-2" style={outfit.style}>
                All Courses
              </h3>
              <CourseList
                courses={coursesWithStatus}
                loading={loadingCourses}
              />
            </div>
          </div>
        </div>
      </PageFormat>
    </ProtectedRoute>
  );
}
