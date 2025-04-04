import React from "react";
import { Slider } from "@/components/ui/slider";
import { outfit } from "@/app/fonts";
import { CourseType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props extends CourseType {
  status: number;
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
    <div className="flex gap-4 p-4 hover:bg-[#f1eae5] dark:hover:bg-stone-900 rounded-md w-full">
      <div
        style={{ background: color }}
        className={cn(`min-w-[55px] h-[55px] rounded-md overflow-hidden`)}
      >
        <div className="text-white text-5xl -rotate-12 translate-x-2 translate-y-2">
          <Icon />
        </div>
      </div>
      <div className="w-full">
        <div className="flex justify-between pb-2">
          <div className="flex flex-col">
            <span className={cn(outfit.className, "font-bold")}>{name}</span>
            <span className="text-lightCoffee text-xs italics">{status}%</span>
          </div>
          <span className="text-sm">
            {lessons.length} lesson{lessons.length > 1 ? "s" : ""}
          </span>
        </div>
        <Slider disabled={true} defaultValue={[status]} max={100} step={1} />
      </div>
    </div>
  );
});

export default Course;
