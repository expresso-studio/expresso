import React from "react";
import { CourseStatus, CourseType, MetricType } from "@/lib/types";
import { IoHandLeft } from "react-icons/io5";
import { BiCheckDouble, BiSolidSmile } from "react-icons/bi";
import { BsPersonRaisedHand } from "react-icons/bs";
import Course from "@/components/course";
import { outfit } from "@/app/fonts";
import Image from "next/image";
import Link from "next/link";
import { MetricNameToDisplay } from "@/lib/constants";
import CourseList from "./course-list";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface Props {
  loading: boolean;
  metrics: MetricType[];
  courses: (CourseType & CourseStatus)[];
}

export default function Recommendations({ loading, metrics, courses }: Props) {
  // get incomplete courses with lowest metrics sorted by value
  const incompleteMetrics: MetricType[] = metrics
    .filter((metric) =>
      courses.some((course) =>
        course.topics.includes(MetricNameToDisplay[metric.name])
      )
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, 3); // Get top 3 lowest values
  // TODO(casey): make it do the ones that aren't in the optimal ranges

  const recommendedCourses: (CourseType & CourseStatus)[] = courses.filter(
    (course) => {
      const relatedMetric = metrics.find((metric) =>
        course.topics.includes(MetricNameToDisplay[metric.name])
      );
      return relatedMetric != null && course.status < 100 ? course : null;
    }
  );

  console.log(courses);
  console.log(metrics);
  console.log(incompleteMetrics);

  if (loading) {
    return (
      <div className="animate-pulse relative w-full h-[30vh] rounded-lg bg-lightGray dark:bg-darkGray p-4 overflow-hidden"></div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="relative w-full h-[30vh] rounded-lg bg-lightGray dark:bg-darkGray group cursor-pointer p-4 overflow-hidden"></div>
    );
  }

  return (
    <div className="relative w-full rounded-lg bg-lightGray dark:bg-darkGray p-4 overflow-hidden">
      <div className="p-4">
        <h2
          style={outfit.style}
          className="text-2xl font-bold uppercase text-[#4e2b12] dark:text-darkCoffee"
        >
          Recommendations
        </h2>
        <div className="text-lg text-darkCoffee dark:text-darkLatte mt-2">
          {incompleteMetrics.length > 0 ? (
            <>
              <div>
                It looks like you could use some help in:
                {incompleteMetrics.map((metric, i) => (
                  <span key={metric.name}>
                    {i < incompleteMetrics.length - 1 ? " " : " and "}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          className="group"
                          onClick={() => window.print()}
                        >
                          <span className="flex">
                            <b className="hover:underline">
                              {MetricNameToDisplay[metric.name]}
                            </b>
                            <Info className="" size={12} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Your average score is <b>{metric.score.toFixed(2)}</b>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {i < incompleteMetrics.length - 1 ? "," : "."}
                  </span>
                ))}
              </div>
              <div>We recommend these courses to improve:</div>
            </>
          ) : (
            "Great job! You're making good progress in all areas."
          )}
        </div>
      </div>
      {incompleteMetrics.length > 0 && (
        <CourseList courses={recommendedCourses} />
      )}
    </div>
  );
}
