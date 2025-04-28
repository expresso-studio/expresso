import React from "react";
import { Slider } from "@/components/ui/slider";
import { outfit } from "@/app/fonts";
import { CourseType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CourseNameToLink } from "@/lib/constants";
import Link from "next/link";

interface Props extends CourseType {
  status?: number;
}

const Course = React.memo<Props>(function Course({
  icon,
  color,
  name,
  status,
  lessons,
}) {
  const Icon = icon;

  return (
    <Link
      href={`/dashboard/learning/courses/${CourseNameToLink[name]}`}
      className="w-full"
    >
      <div className="flex gap-4 p-4 hover:bg-[#f1eae5] dark:hover:bg-stone-900 rounded-md w-full group cursor-pointer">
        <div
          style={{ background: color }}
          className={cn(`min-w-[55px] h-[55px] rounded-md overflow-hidden`)}
        >
          <div className="text-white text-5xl -rotate-12 translate-x-2 translate-y-2 group-hover:-rotate-0 duration-300">
            <Icon />
          </div>
        </div>
        <div className="w-full">
          <div className="flex justify-between pb-2">
            <div className="flex flex-col">
              <span className={cn(outfit.className, "font-bold")}>{name}</span>
              {status !== undefined ? (
                <span className="text-lightCoffee text-xs italics">
                  {status}%
                </span>
              ) : (
                <span className="bg-lightCoffee/50 rounded-full text-xs w-8 h-4 animate-pulse">
                  {status}
                </span>
              )}
            </div>
            <span className="text-sm">
              {lessons.length} lesson{lessons.length > 1 ? "s" : ""}
            </span>
          </div>
          {status !== undefined ? (
            <>
              <Slider
                disabled={true}
                defaultValue={[status]}
                max={100}
                step={1}
              />
              <></>
            </>
          ) : (
            <Slider
              className="animate-pulse"
              disabled={true}
              defaultValue={[100]}
              max={100}
              step={1}
            />
          )}
        </div>
      </div>
    </Link>
  );
});

export default Course;
