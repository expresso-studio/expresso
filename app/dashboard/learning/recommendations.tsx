import React from "react";
import { CourseType, MetricType } from "@/lib/types";
import { IoHandLeft } from "react-icons/io5";
import { BiCheckDouble, BiSolidSmile } from "react-icons/bi";
import { BsPersonRaisedHand } from "react-icons/bs";
import Course from "@/components/course";
import { outfit } from "@/app/fonts";
import Image from "next/image";
import Link from "next/link";

interface Props {
  loading: boolean;
  metrics: MetricType[];
  courses: CourseType[];
}

export default function Recommendations({ loading, metrics, courses }: Props) {
  // Get incomplete metrics sorted by value
  const incompleteMetrics = metrics
    .filter((metric) => {
      const relatedCourse = courses.find(
        (course) => course.name === metric.name
      );
      return relatedCourse && relatedCourse.status < 100;
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3); // Get top 3 lowest values

  console.log(metrics.length);
  if (loading) {
    return (
      <div className="animate-pulse relative w-full h-[30vh] rounded-lg dark:bg-lightCream bg-lightLatte/50 p-4 overflow-hidden"></div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="relative w-full h-[30vh] rounded-lg dark:bg-lightCream bg-lightLatte/50 group cursor-pointer p-4 overflow-hidden">
        <Link href="/dashboard/eval-settings">
          <div className="absolute z-20 flex flex-col gap-2 w-full">
            <span className="text-2xl lg:text-4xl italic text-lightCream dark:text-darkLatte group-hover:translate-x-2 duration-200">
              you don't have any presentations yet!
            </span>
            <span className="text-6xl md:text-[5vw] font-black text-[#4e2b12] dark:text-darkCoffee uppercase group-hover:translate-x-1 duration-500">
              Make one Now
            </span>
          </div>
          <div className="h-[30vh] flex flex-col items-end justify-center">
            <Image
              src="/coffee_bean.svg"
              alt={""}
              width="500"
              height="500"
              className="w-[80%] max-w-[450px] absolute translate-x-12  z-10 scale-50 group-hover:rotate-6 group-hover:scale-y-[0.51] ease-out duration-200"
            />
            <div className="flex flex-row justify-end items-end w-full h-full">
              <div className="dark:bg-lightLatte/15 bg-lightCoffee/50 w-[80%] h-[80%] translate-y-5 z-0 rounded-lg group-hover:scale-105 duration-500"></div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[30vh] rounded-lg dark:bg-lightCream bg-lightLatte/50 p-4 overflow-hidden">
      <h2
        style={outfit.style}
        className="text-2xl font-bold uppercase text-[#4e2b12] dark:text-darkCoffee"
      >
        Recommendations
      </h2>
      <div className="text-darkCoffee dark:text-darkLatte mt-2">
        {incompleteMetrics.length > 0 ? (
          <>
            Here are some areas you could improve:
            <div className="flex flex-col gap-2 mt-2">
              {incompleteMetrics.map((metric) => {
                const relatedCourse = courses.find(
                  (course) => course.name === metric.name
                );
                return (
                  <div key={metric.name} className="flex items-center gap-2">
                    <span className="font-semibold">{metric.name}:</span>
                    <span>{relatedCourse?.name}</span>
                    <span className="text-sm">
                      (Current progress: {relatedCourse?.status}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          "Great job! You're making good progress in all areas."
        )}
      </div>
    </div>
  );
}
