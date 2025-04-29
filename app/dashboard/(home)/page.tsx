// app/dashboard/page.tsx
"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import Section from "@/components/section";
import Image from "next/image";
import Link from "next/link";
import ProgressSection from "./progress";
import PreviousPresentationsSection from "./previous-presentations";
import CourseList from "../learning/course-list";
import LogoutButton from "@/components/logout-button";
import ProtectedRoute from "@/components/protected-route";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import { Courses, CourseStatuses } from "@/lib/constants";

/**
 * Page component that renders the dashboard page.
 * @returns {JSX.Element} The JSX element representing the dashboard page.
 */
export default function Page() {
  const { user, isAuthenticated, error, refreshToken } = useAuthUtils();
  // TODO(casey): replace with actual status
  const coursesWithStatus = Courses.map((course) => {
    const matchingCourse = CourseStatuses.find(
      (courseStatus) => courseStatus.name === course.name,
    );

    if (matchingCourse) {
      return { ...course, ...matchingCourse };
    }

    return { ...course, status: 0 };
  });

  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);

  // Wrap the component with ProtectedRoute to ensure authentication
  return (
    <ProtectedRoute>
      {isAuthenticated && user ? (
        <PageFormat breadCrumbs={[]}>
          <div className="flex justify-between">
            <Heading1 id="greeting">
              Hi{" "}
              <span className="text-lightCoffee dark:text-darkCoffee">
                {user.nickname}
              </span>
              !
            </Heading1>
            <LogoutButton />
          </div>
          <div className="mt-4 mb-16 flex flex-col md:flex-row gap-16">
            <div className="flex flex-col gap-16 w-full">
              <Section
                id="evaluate"
                title="Jump on in!"
                link={"/dashboard/eval-settings"}
                className="sm:min-w-[300px] bg-lightCoffee dark:bg-darkCoffee group cursor-pointer"
              >
                <Link
                  href={"/dashboard/eval-settings"}
                  className=" overflow-hidden"
                >
                  <div className="absolute z-20 flex flex-col gap-2 w-full">
                    <span className="text-6xl md:text-[5vw] font-black text-white uppercase group-hover:translate-x-1 duration-200">
                      Evaluate
                    </span>
                    <span className="text-2xl lg:text-4xl italic text-white group-hover:translate-x-2 duration-500">
                      a new presentation
                    </span>
                  </div>
                  <div className="h-[30vh] flex flex-col items-end justify-end">
                    <Image
                      src={"/teapot.svg"}
                      alt={"a teapot"}
                      width="500"
                      height="500"
                      className="w-[80%] max-w-[450px] absolute translate-x-12 translate-y-12 scale-x-[-1] z-10 group-hover:rotate-6 group-hover:scale-y-[1.05] ease-out duration-200"
                    />
                    <div className="flex flex-row justify-end items-end w-full h-full">
                      <div className="bg-[#ac795d] dark:bg-[#9c6446] w-[80%] h-[80%] z-0 rounded-lg group-hover:scale-105 duration-500"></div>
                    </div>
                  </div>
                </Link>
              </Section>
              <Section
                id="learning"
                link={"/dashboard/learning"}
                title="Learning"
              >
                <CourseList courses={coursesWithStatus} />
              </Section>
            </div>
            <div className="flex flex-col gap-16 w-full">
              <PreviousPresentationsSection />
              <ProgressSection />
            </div>
          </div>
        </PageFormat>
      ) : null}
    </ProtectedRoute>
  );
}
