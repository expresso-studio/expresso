import React, { useEffect, useRef, useState } from "react";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { PresentationType } from "@/lib/types";
import { LuSpeech } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import Image from "next/image";

interface Props extends PresentationType {
  className?: string;
  loading?: boolean;
}

const Recording = React.memo<Props>(function Recording({
  id,
  title,
  video_url,
  created_at,
  metrics,
  className,
  loading,
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthUtils();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!video_url || isLoading || !isAuthenticated || !user?.sub) return;

    const fetchSignedUrl = async () => {
      try {
        const res = await fetch(
          `/api/get-signed-url?videoKey=${encodeURIComponent(
            video_url
          )}&user=${encodeURIComponent(user.sub ?? "")}`
        );
        if (!res.ok) {
          console.error("Failed to fetch signed URL");
          return;
        }
        const data = await res.json();
        setSignedUrl(data.url);
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
    };

    fetchSignedUrl();
  }, [video_url, user?.sub]);

  const handleLoadedData = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0.1;
      video.pause();
      setIsLoaded(true);
    }
  };

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
          "absolute bg-lightCream dark:bg-darkBurnt w-min rounded-xl px-2 translate-x-2 translate-y-2 z-10",
          "flex items-center gap-2"
        )}
      >
        <LuSpeech />
        {metrics?.score ?? 0}%
      </div>
      {signedUrl ? (
        <video
          ref={videoRef}
          onLoadedData={handleLoadedData}
          className={cn(
            "w-full h-[144px] rounded-md object-cover",
            !isLoaded && "hidden"
          )}
          muted
          playsInline
        >
          <source src={signedUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="bg-[#e0cabf] dark:bg-[#463f3c] w-full h-[144px] rounded-md" />
      )}
      {!isLoaded && signedUrl && (
        <div className="animate-pulse bg-darkCoffee/50 w-full h-[144px] rounded-md flex items-start justify-end relative overflow-hidden">
          <Image
            src={"./coffee_bean.svg"}
            alt={""}
            width={100}
            height={100}
            className="absolute translate-y-4 translate-x-2 opacity-40"
          />
        </div>
      )}
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
