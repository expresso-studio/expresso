import React from "react";
import { Slider } from "@/components/ui/slider";
import { outfit } from "@/app/fonts";
import { LessonType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface Props extends LessonType {
  status: boolean;
  color: string;
}

const Lesson = React.memo<Props>(function Lesson({
  icon,
  name,
  status,
  color,
  topics,
}) {
  const Icon = icon;

  return (
    <div className="flex gap-4 p-4 hover:bg-lightCream/50 dark:hover:bg-stone-900 rounded-md w-full group cursor-pointer">
      <div
        style={{ borderColor: color }}
        className={cn(
          `min-w-[55px] h-[55px] rounded-md overflow-hidden border bg-white dark:bg-darkGray`
        )}
      >
        <div
          style={{ color: color }}
          className="text-5xl -rotate-12 translate-x-2 translate-y-2 group-hover:-rotate-0 duration-300"
        >
          <Icon />
        </div>
      </div>
      <div className="w-full">
        <div className="flex flex-col">
          <span className={cn(outfit.className, "font-bold text-lg")}>
            {name}
          </span>
          <div className="w-full flex gap-2">
            {topics.map((topic) => (
              <div
                key={topic}
                className="rounded-full bg-lightCaramel/50 text-white px-2"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-h flex items-center justify-center text-2xl text-lightCoffee">
        {status ? <Check /> : <X />}
      </div>
    </div>
  );
});

export default Lesson;
