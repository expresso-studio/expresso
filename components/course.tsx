import React from "react";
import { Slider } from "@/components/ui/slider";
import { outfit } from "@/app/fonts";
import { CourseType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props extends CourseType {}

const Course = React.memo<Props>(function Course({
  id,
  icon,
  color,
  text,
  status,
  nLessons,
}) {
  return (
    <div className="flex gap-4 p-4 hover:bg-[#f1eae5] dark:hover:bg-stone-900 rounded-md w-full">
      <div
        className={cn(
          color,
          "min-w-[55px] h-[55px] rounded-md overflow-hidden "
        )}
      >
        <div className="text-white text-5xl -rotate-12 translate-x-2 translate-y-2">
          {icon}
        </div>
      </div>
      <div className="w-full">
        <div className="flex justify-between pb-2">
          <div className="flex flex-col">
            <span className={cn(outfit.className, "font-bold")}>{text}</span>
            <span className="text-lightCoffee text-xs italics">{status}%</span>
          </div>
          <span className="text-sm">{nLessons} lessons</span>
        </div>
        <Slider disabled={true} defaultValue={[status]} max={100} step={1} />
      </div>
    </div>
  );
});

export default Course;
