"use client";

import { useEffect, useState, use } from "react";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import { outfit } from "@/app/fonts";
import { cn, transformMetricsToGestureMetrics } from "@/lib/utils";
import { MetricType } from "@/lib/types";
import { Download, LoaderCircle, MessagesSquare, Info } from "lucide-react";
import Loading from "@/components/loading";
import PageFormat from "@/components/page-format";
import Heading1 from "@/components/heading-1";
import Link from "next/link";
import { MetricsDisplay } from "@/app/dashboard/evaluate/gesture-analysis";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Metric {
  metric_id: number;
  presentation_id: string;
  score: number;
  evaluated_at: string;
  name: string;
}

interface Presentation {
  id: string;
  title: string;
  video_url: string;
  slides_url: string;
  transcript_url: string;
  created_at: string;
  metrics: Metric[];
  transcript_text?: string;
}

interface VideoPlayerProps {
  videoKey: string;
  userId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoKey, userId }) => {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!videoKey || !userId) return;

    const fetchSignedUrl = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/get-signed-url?videoKey=${encodeURIComponent(
            videoKey
          )}&user=${encodeURIComponent(userId)}`
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
        console.error("Error fetching signed URL", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load video. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent overwhelming the server
    const timeoutId = setTimeout(fetchSignedUrl, 500);
    return () => clearTimeout(timeoutId);
  }, [videoKey, userId]);

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("Video loading error:", e);
    setError(
      "Failed to load video. The video may be corrupted or unavailable."
    );
  };

  if (error) {
    return <></>;
  }

  if (isLoading || !signedUrl) {
    return (
      <div className="animate-pulse w-full h-[342px] flex items-center justify-center rounded-lg shadow-lg bg-stone-300 dark:bg-stone-800">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        className="w-full rounded-lg shadow-lg border border-stone-600"
        controls
        onError={handleVideoError}
        preload="metadata"
      >
        <source src={signedUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default function PresentationPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { user, isAuthenticated, isLoading } = useAuthUtils();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(-1);

  useEffect(() => {
    async function fetchPresentation() {
      if (!user?.sub) return;

      try {
        const res = await fetch(
          `/api/presentation/${params.id}?user=${encodeURIComponent(user.sub)}`,
          {
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch presentation data");
        }

        const data = await res.json();
        setPresentation(data);
        
        const res2 = await fetch(`/api/get-qna-info?userId=${encodeURIComponent(user.sub!)}&id=${params.id}`);
        const scriptTranscript = await res2.json();
        
        if (!res2.ok) {
          throw new Error("Failed to fetch script and transcript");
        }
        const transcriptData = scriptTranscript.transcript[0]?.transcript_text || '';
        const scriptData = scriptTranscript.script[0]?.script_text || '';

        const coverageRes = await fetch("/api/openai_coverage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcriptData, scriptData }),
        });
        
        const scoreData = await coverageRes.json();
        if (scoreData.score === undefined) {
          throw new Error("Failed to fetch coverage score");
        }
        setScore(scoreData.score);
      } catch (err) {
        console.error("Error fetching presentation:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && !isLoading) {
      fetchPresentation();
    }
  }, [params.id, isAuthenticated, isLoading, user]);

  if (loading || isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user?.sub) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
        <p>Please log in to view this presentation.</p>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="w-full h-full flex items-center justify-center text-center">
        <p>Presentation not found.</p>
      </div>
    );
  }

  return (
    <PageFormat
      breadCrumbs={[
        { name: "progress", url: "/dashboard/progress" },
        { name: "previous", url: "/dashboard/progress/previous" },
        { name: presentation.title },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        <div className="flex flex-col gap-2">
          <Heading1 id="user">{presentation.title}</Heading1>
          <VideoPlayer videoKey={presentation.video_url} userId={user.sub} />
          <div className="flex items-center justify-between">
            <p className="text-stone-500">
              Created on:{" "}
              {new Date(presentation.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-stone-100 dark:bg-stone-900 py-6 px-4 rounded-lg h-full mt-4">
            <h2 className={cn("text-xl font-semibold mb-4", outfit.className)}>
              Transcript
            </h2>
            <p className="whitespace-pre-wrap">
              {presentation.transcript_text || "No transcript available."}
            </p>
          </div>
        </div>

        <div className="h-full flex flex-col gap-2">
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className="group"
                  onClick={() => window.print()}
                >
                  <Download
                    className="text-stone-400 group-hover:text-stone-800 dark:text-stone-400 dark:group-hover:text-white duration-200"
                    size={20}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Report</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className ="bg-stone-100 dark:bg-stone-900 py-6 px-4 rounded-lg flex items-center justify-between">
            <p>Practice a QnA session with this presentation!</p>
              <Link
                href={`/dashboard/qna?id=${params.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 p-2 rounded-md bg-darkCoffee group-hover:bg-lightCoffee"
              >
                <MessagesSquare className="mr-2 w-6 h-6"/>
                Launch in New Tab
              </Link>
          </div>
          <div className ="bg-stone-100 dark:bg-stone-900 py-6 px-4 rounded-lg">
            
            <h2 className={cn("text-xl font-semibold mb-4", outfit.className)}>
              Coverage Score

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                      <Info className="ml-2"/>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scored by comparing trascript and the provided script.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h2>
            {score === -1 ? (
              <p className="whitespace-pre-wrap">N/A - No Script Provided.</p>
            ) : (
              <>
                <p className="whitespace-pre-wrap">Score: {score}%</p>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 bg-green-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="mt-2">
                  {score < 50
                    ? "Low coverage indicates indicates that a significant portion of the scripted content was not reflected in the presentation."
                    : score < 85
                    ? "Moderate coverage indicates key parts of the script were included, but some sections were modified or improvised."
                    : "High coverage indicates presentation closely followed the script, with minimal deviation"}
                </p>
              </>
            )}
          </div>
          <div className="bg-stone-100 dark:bg-stone-900 py-6 px-4 rounded-lg h-full">
            <h2 className={cn("text-xl font-semibold mb-4", outfit.className)}>
              Performance Metrics
            </h2>
            <MetricsDisplay
              metrics={transformMetricsToGestureMetrics(
                presentation.metrics as MetricType[]
              )}
            />
          </div>
        </div>
      </div>
    </PageFormat>
  );
}
