import React from "react";
import { CourseStatus, CourseType, MetricType } from "@/lib/types";
import { outfit } from "@/app/fonts";
import Image from "next/image";
import Link from "next/link";
import { CourseNames, MetricNameToDisplay } from "@/lib/constants";
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
        course.topics.includes(MetricNameToDisplay[metric.name]),
      ),
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, 3); // Get top 3 lowest values
  // TODO(casey): make it do the ones that aren't in the optimal ranges

  let recommendedCourses: (CourseType & CourseStatus)[] = courses.filter(
    (course) => {
      const relatedMetric = incompleteMetrics.find((metric) =>
        course.topics.includes(MetricNameToDisplay[metric.name]),
      );
      return relatedMetric != null && course.status < 100 ? course : null;
    },
  );

  const beginnerCourse: (CourseType & CourseStatus) | undefined = courses.find(
    (course) => course.name == CourseNames.Intro && course.status < 100,
  );

  if (beginnerCourse) {
    recommendedCourses = [beginnerCourse].concat(recommendedCourses);
  }

  console.log(courses);
  console.log(metrics);
  console.log(incompleteMetrics);

  if (loading) {
    return (
      <div className="animate-pulse relative w-full h-[30vh] rounded-lg bg-lightGray dark:bg-darkGray p-4 overflow-hidden">
        <div className="p-4 opacity-50">
          <h2 className="h-[30px] w-full bg-[#4e2b12] dark:bg-darkCoffee rounded-full"></h2>
          <div className="flex flex-col gap-4 mt-8 ">
            <div className="h-[20px] w-full bg-darkCoffee dark:bg-darkLatte rounded-full"></div>
            <div className="h-[20px] w-[50%] bg-darkCoffee dark:bg-darkLatte rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="relative w-full rounded-lg bg-lightGray dark:bg-darkGray group cursor-pointer p-4 overflow-hidden">
        <div className="p-4">
          <h2
            style={outfit.style}
            className="text-2xl font-bold uppercase text-[#4e2b12] dark:text-darkCoffee"
          >
            Recommendations
          </h2>
          <div className="text-lg text-darkCoffee dark:text-darkLatte mt-2">
            <div>
              {"It looks like you haven't made your first presentation yet!"}
            </div>
            <MakePresentationButton text="Make your first" />
          </div>
        </div>
        {beginnerCourse && <CourseList courses={[beginnerCourse]} />}
      </div>
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
            <>
              <div>
                {
                  "Great job! You're making good progress in all areas. Maybe try practicing some new presentations:"
                }
              </div>
              <MakePresentationButton text="Make a new" />
            </>
          )}
        </div>
      </div>
      {incompleteMetrics.length > 0 && (
        <CourseList courses={recommendedCourses} />
      )}
    </div>
  );
}

interface MakePresentationProps {
  text: string;
}

const MakePresentationButton = ({ text }: MakePresentationProps) => {
  return (
    <Link href="/dashboard/eval-settings">
      <div className="p-4 flex items-center gap-2 group w-full h-[120px] rounded-lg hover:bg-lightCoffee/50 bg-lightCoffee/75 dark:bg-darkCoffee dark:hover:bg-darkCoffee/50 relative overflow-hidden duration-200">
        <div className="h-full flex-col justify-center">
          <p
            className="text-white dark:text-darkBurnt text-2xl font-bold uppercase group-hover:translate-x-2 duration-500"
            style={outfit.style}
          >
            {text}
          </p>
          <p
            className="text-white dark:text-darkBurnt text-5xl font-bold uppercase group-hover:translate-x-4 duration-500"
            style={outfit.style}
          >
            Presentation!
          </p>
        </div>
        <Image
          src={"/cup.svg"}
          alt={""}
          width={200}
          height={200}
          className="duration-500 translate-y-4 -rotate-2 group-hover:rotate-12"
        ></Image>
      </div>
    </Link>
  );
};
