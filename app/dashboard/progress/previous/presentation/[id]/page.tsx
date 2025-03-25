"use client";

import { useEffect, useState, use } from "react";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import { outfit } from "@/app/fonts";
import { cn, transformMetricsToGestureMetrics } from "@/lib/utils";
import { MetricType } from "@/lib/types";
import { Download, LoaderCircle, MessagesSquare } from "lucide-react";
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

  useEffect(() => {
    if (!videoKey || !userId) return;
    const fetchSignedUrl = async () => {
      try {
        const res = await fetch(
          `/api/get-signed-url?videoKey=${encodeURIComponent(
            videoKey
          )}&user=${encodeURIComponent(userId)}`
        );
        if (!res.ok) {
          console.error("Failed to fetch signed URL, status:", res.status);
          return;
        }
        const data = await res.json();
        setSignedUrl(data.url);
      } catch (error) {
        console.error("Error fetching signed URL", error);
      }
    };
    fetchSignedUrl();
  }, [videoKey, userId]);

  if (!signedUrl) {
    return (
      <div className="animate-pulse w-full h-[342px] flex items-center justify-center rounded-lg shadow-lg bg-stone-300 dark:bg-stone-800">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <video
        className="w-full rounded-lg shadow-lg border border-stone-600"
        controls
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
      <div className="w-full h-full items-center justify-center">
        Please log in to view this presentation.
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="w-full h-full items-center justify-center">
        Presentation not found.
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="group">
                  <Link
                    href="/dashboard/qna"
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-darkCoffee group-hover:bg-lightCoffee"
                  >
                    <MessagesSquare size={14} />
                    QnA
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Practice a QnA session with this presentation!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
