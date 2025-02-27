import React from "react";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { RecordingType } from "@/lib/types";
import { LuSpeech } from "react-icons/lu";
import Image from "next/image";

interface Props extends RecordingType {
  className?: string;
}

const Recording = React.memo<Props>(function Recording({
  title,
  thumbnail,
  date,
  overallScore,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 relative bg-[#fcf5f0] hover:bg-[#fffbf8] hover:shadow-sm p-2 rounded-md",
        className
      )}
    >
      <div
        className={cn(
          "absolute bg-lightCream dark:bg-darkBurnt w-min rounded-xl px-2 translate-x-2 translate-y-2",
          "flex items-center gap-2"
        )}
      >
        <LuSpeech />
        {overallScore}
      </div>
      <Image
        src={thumbnail}
        alt={title}
        width={960}
        height={720}
        className="rounded-md"
      />
      <div className="flex items-center justify-between truncate gap-4">
        <span className={cn("font-bold truncate", outfit.className)}>
          {title}
        </span>
        <span className="italics text-sm text-stone-500">
          {date.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
});

export default Recording;
