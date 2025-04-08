import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import {
  CourseNames,
  CourseNameToLink,
  LessonNameToLink,
} from "@/lib/constants";
import { LessonType } from "@/lib/types";
import { Check, X } from "lucide-react";

interface Props extends LessonType {
  status: boolean;
  courseName: CourseNames;
  color: string;
  children: React.ReactNode;
}

export default function LessonFormat({
  icon,
  color,
  courseName,
  name,
  topics,
  status,
  children,
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
        {
          url: `/dashboard/learning/courses/${CourseNameToLink[courseName]}`,
          name: CourseNameToLink[courseName],
        },
        { name: LessonNameToLink[name] },
      ]}
    >
      <div
        style={{ background: color }}
        className="w-full h-[100px] flex items-center justify-center rounded-md overflow-hidden"
      >
        <div className="flex gap-4">
          {rotates.map((rotate) => (
            <div className="text-white text-5xl" key={rotate}>
              <Icon />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between">
          <div>
            <span>Lesson</span>
            <Heading1 id="intro">{name}</Heading1>
          </div>
          <div className="flex flex-col items-end">
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
            <div className="flex gap-2">
              Complete: {status ? <Check /> : <X />}
            </div>
          </div>
        </div>
        <div className="h-[1px] w-full bg-lightGray dark:bg-darkGray"></div>
        {children}
      </div>
    </PageFormat>
  );
}
