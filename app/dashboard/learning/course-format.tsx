import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { CourseNames, CourseNameToLink } from "@/lib/constants";
import { CourseType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Lesson from "@/components/lesson";
import { outfit } from "@/app/fonts";
import { Slider } from "@/components/ui/slider";
import CourseProgress from "./course-progress";

interface Props extends CourseType {
  status: number;
}

export default function CourseFormat({
  id,
  icon,
  color,
  name,
  topics,
  status,
  lessons,
}: Props) {
  const Icon = icon;
  const rotates = [
    "-rotate-12",
    "rotate-6",
    "rotate-0",
    "rotate-6",
    "rotate-12",
  ];

  return (
    <PageFormat
      breadCrumbs={[
        { url: "/dashboard/learning", name: "learning" },
        { url: "/dashboard/learning/courses", name: "courses" },
        { name: CourseNameToLink[name] },
      ]}
    >
      <div
        style={{ background: color }}
        className="w-full h-[100px] flex items-center justify-center rounded-md overflow-hidden"
      >
        <div className="flex gap-4">
          {rotates.map((rotate) => (
            <div className="text-white text-5xl">
              <Icon />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-8 justify-between">
        <div className="min-w-[400px] flex flex-col gap-8 p-8 bg-white/50 dark:bg-darkBurnt rounded-lg">
          <div>
            <Heading1 id="intro">{name}</Heading1>
            <div className="w-full flex gap-2 flex-wrap mt-2">
              {topics.map((topic) => (
                <div
                  key={topic}
                  style={{ background: color }}
                  className="rounded-full text-white px-2"
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
          <CourseProgress status={status} color={color} />
        </div>
        <div className="w-full sm:mt-4">
          <div className="flex justify-between">
            <h2 className="font-bold text-xl" style={outfit.style}>
              Lessons
            </h2>
            <span className="text-sm">
              {lessons.length} lesson{lessons.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col p-4 bg-lightCoffee/10 dark:bg-black/75 rounded-lg">
            {lessons.map((lesson, i) => (
              <Lesson {...lesson} status={i % 2 == 0} color={color} />
            ))}
          </div>
        </div>
      </div>
    </PageFormat>
  );
}
