import React, { useEffect, useRef, useState } from "react";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { PresentationType } from "@/lib/types";
import { LuSpeech } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import Image from "next/image";
import { MetricNames } from "@/lib/constants";

interface Props extends PresentationType {
  className?: string;
  loading?: boolean;
}

/**
 * Renders a recording card with a video preview, title, and creation date.
 * @param props - The props for the Recording component.
 * @returns The rendered recording card.
 */
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!video_url || isLoading || !isAuthenticated || !user?.sub) return;

    const fetchSignedUrl = async () => {
      try {
        const res = await fetch(
          `/api/get-signed-url?videoKey=${encodeURIComponent(
            video_url,
          )}&user=${encodeURIComponent(user.sub ?? "")}`,
        );
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (!res.ok) {
          throw new Error("Failed to fetch video URL");
        }

        setSignedUrl(data.url);
        setError(null);
      } catch (error) {
        console.error("Error fetching signed URL:", error);
        setError("Failed to load video preview");
      }
    };

    fetchSignedUrl();
  }, [video_url, user?.sub, isAuthenticated, isLoading]);

  const handleLoadedData = React.useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0.01;
      video.pause();
      setIsLoaded(true);
    }
  }, []);

  const handleVideoError = React.useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      console.error("Video loading error:", e);
      setError("Failed to load video preview");
    },
    [],
  );

  const handleClick = React.useCallback(() => {
    console.log("opening ", id);
    if (user?.sub && id) {
      router.push(`/dashboard/progress/previous/presentation/${id}`);
    }
  }, [user?.sub, id, router]);

  if (loading) {
    return (
      <div
        className={cn(
          "animate-pulse w-[220px] h-[180px] flex flex-col gap-2 relative bg-[#fffbf9] dark:bg-stone-900 hover:shadow-sm p-2 rounded-md",
          className,
        )}
      >
        <div
          className={cn(
            "absolute bg-lightCream dark:bg-darkBurnt w-min rounded-xl px-2 translate-x-2 translate-y-2",
            "h-[1em] w-[2em]",
          )}
        ></div>
        <div className="bg-darkCoffee/50 w-full h-[144px] rounded-md flex items-start justify-end relative overflow-hidden">
          <Image
            src={"/coffee_bean.svg"}
            alt={""}
            width={100}
            height={100}
            className="absolute translate-y-4 translate-x-2 opacity-40"
          />
        </div>
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
        className,
      )}
    >
      <div
        className={cn(
          "absolute bg-lightCream dark:bg-darkBurnt w-min rounded-xl px-2 translate-x-2 translate-y-2 z-10",
          "flex items-center gap-2",
        )}
      >
        <LuSpeech />
        {metrics.find((metric) => metric.name == MetricNames.OverallScore)
          ?.score ?? 0}
        %
      </div>
      {error ? (
        <div className="w-full h-[144px] rounded-md flex items-center justify-center bg-darkCoffee/50 relative overflow-hidden">
          <Image
            src={"/teapot.svg"}
            alt={""}
            width={200}
            height={200}
            className="absolute translate-y-4 translate-x-2"
            unoptimized
          />
        </div>
      ) : signedUrl ? (
        <video
          ref={videoRef}
          onLoadedData={handleLoadedData}
          onError={handleVideoError}
          className={cn(
            "w-full h-[144px] rounded-md object-cover",
            !isLoaded && "hidden",
          )}
          muted
          playsInline
        >
          <source src={signedUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="animate-pulse bg-darkCoffee/50 w-full h-[144px] rounded-md flex items-start justify-end relative overflow-hidden">
          <Image
            src={"/coffee_bean.svg"}
            alt={""}
            width={100}
            height={100}
            className="absolute translate-y-4 translate-x-2 opacity-40"
            unoptimized
          />
        </div>
      )}
      {!isLoaded && signedUrl && !error && (
        <div className="animate-pulse bg-darkCoffee/50 w-full h-[144px] rounded-md flex items-start justify-end relative overflow-hidden">
          <Image
            src={"/coffee_bean.svg"}
            alt={""}
            width={100}
            height={100}
            className="absolute translate-y-4 translate-x-2 opacity-40"
            unoptimized
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
