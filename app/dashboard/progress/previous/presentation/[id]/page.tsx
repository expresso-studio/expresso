"use client";

import { useEffect, useState, use } from "react";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import { outfit } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import Loading from "@/components/loading";
import PageFormat from "@/components/page-format";
import Heading1 from "@/components/heading-1";

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
}

interface VideoPlayerProps {
  videoKey: string;
  userId: string;
}

const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Calculate width of progress bar
  const progressWidth = Math.max(0, Math.min(100, metric.score));

  return (
    <div className="bg-white dark:bg-stone-800 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-lg">{metric.name}</h3>
        <span className={cn("font-bold", getScoreColor(metric.score))}>
          {metric.score.toFixed(1)}%
        </span>
      </div>

      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getScoreColor(metric.score).replace("text-", "bg-")
          )}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <p className="text-sm text-stone-500 mt-2">
        Evaluated: {new Date(metric.evaluated_at).toLocaleDateString()}
      </p>
    </div>
  );
};

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
    return <div>Please log in to view this presentation.</div>;
  }

  if (!presentation) {
    return <div>Presentation not found.</div>;
  }

  return (
    <PageFormat
      breadCrumbs={[
        { name: "progress", url: "/dashboard/progress" },
        { name: "previous", url: "/dashboard/progress/previous" },
        { name: presentation.title },
      ]}
    >
      <Heading1 id="user">{presentation.title}</Heading1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        <div>
          <VideoPlayer videoKey={presentation.video_url} userId={user.sub} />
          <div className="mt-2">
            <p className="text-stone-500">
              Created on:{" "}
              {new Date(presentation.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="bg-stone-100 dark:bg-stone-900 py-6 px-4 rounded-lg h-full">
          <h2 className={cn("text-xl font-semibold mb-4", outfit.className)}>
            Performance Metrics
          </h2>
          <div className="space-y-4">
            {presentation.metrics.map((metric) => (
              <MetricCard key={metric.metric_id} metric={metric} />
            ))}
          </div>
        </div>
      </div>
    </PageFormat>
  );
}
