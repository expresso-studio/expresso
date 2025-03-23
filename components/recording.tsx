import React from "react";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { RecordingType } from "@/lib/types";
import { LuSpeech } from "react-icons/lu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthUtils } from "@/hooks/useAuthUtils";

interface Props extends RecordingType {
  className?: string;
  loading?: boolean;
}

const Recording = React.memo<Props>(function Recording({
  id,
  title,
  thumbnail,
  created_at,
  overallScore,
  className,
  loading,
}) {
  const router = useRouter();
  const { user } = useAuthUtils();

  const handleClick = () => {
    if (user?.sub && id) {
      router.push(`/dashboard/progress/previous/presentation/${id}`);
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          "animate-pulse w-[220px] h-[180px] flex flex-col gap-2 relative bg-[#fffbf9] dark:bg-stone-900 hover:shadow-sm p-2 rounded-md",
          className
        )}
      >
        <div
          className={cn(
            "absolute bg-lightCream dark:bg-darkBurnt w-min rounded-xl px-2 translate-x-2 translate-y-2",
            "h-[1em] w-[2em]"
          )}
        ></div>
        <div className="bg-[#e0cabf] dark:bg-[#463f3c] w-full h-[144px] rounded-md" />
        <div className="flex items-center justify-between truncate gap-4 pt-2 pb-3">
          <span className="bg-stone-200 h-[1em] dark:bg-stone-800 rounded-full w-full"></span>
          <span className="bg-stone-200 h-[1em] dark:bg-stone-800 rounded-full w-1/2"></span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "w-[220px] h-[180px] flex flex-col gap-2 relative bg-[#fffbf9] hover:bg-[#fffbf8] dark:bg-stone-900 hover:dark:bg-[#3e322e] hover:shadow-sm p-2 rounded-md cursor-pointer",
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
        {overallScore}%
      </div>
      <Image
        src={thumbnail}
        alt={title}
        width={960}
        height={720}
        className="rounded-md"
      />
      <div className="flex items-center justify-between truncate gap-4">
        <span
          className={cn("font-bold truncate dark:text-white", outfit.className)}
        >
          {title}
        </span>
        <span className="italics text-sm text-stone-500">
          {new Date(created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
});

export default Recording;
