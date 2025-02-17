import React from "react";
import { cn } from "@/lib/utils";
import { outfit } from "@/app/fonts";

// TODO: remove dummy values
const fillerWords: string[] = ["um", "like", "but"];

interface Props {
  short?: boolean;
}

const TopFiller = React.memo<Props>(function TopFiller({ short }) {
  return (
    <div
      className={cn(
        "w-full rounded-lg relative overflow-hidden py-4 px-6",
        "bg-lightLatte dark:bg-darkLatte"
      )}
    >
      <div className="pb-4">Most frequent filler words</div>
      <div className="flex items-start justify-between">
        {fillerWords.map(
          (fillerWord, i) =>
            (!short || i < 1) && (
              <div
                className={cn(
                  "flex rounded-md items-start gap-1 group",
                  outfit.className
                )}
                key={i}
              >
                <span className="text-[#f9cca5] font-bold text-xl">
                  {i + 1}
                </span>
                <span className="text-white font-bold text-4xl translate-y-2">
                  {fillerWord}
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
});

export default TopFiller;
