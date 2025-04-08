import React from "react";
import { MetricType, ReportItemType } from "@/lib/types";
import {
  cn,
  generateRecommendations,
  transformMetricsToAnalysisData,
} from "@/lib/utils";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import {
  MetricNames,
  MetricNameToDisplay,
  MetricNameToIcon,
  MetricNameToId,
} from "@/lib/constants";
import { outfit } from "@/app/fonts";
import { Lightbulb } from "lucide-react";

interface Props {
  short?: boolean;
}

const Summary = React.memo<Props>(function Summary({ short }) {
  const { user, isAuthenticated, isLoading, error, refreshToken } =
    useAuthUtils();
  const [avgMetrics, setAvgMetrics] = React.useState<MetricType[]>([]);
  const [loadingReports, setLoadingReports] = React.useState(true);
  const [recommendations, setRecommendations] = React.useState<string[]>([]);

  const loadingBubbles = [1, 2, 3, 4, 5, 6, 7];

  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);

  function calculateAvgMetrics(reports: ReportItemType[]) {
    // Create an object to hold the total sums and count for each category
    const categorySums: { [index: string]: number } = {};
    const categoryCounts: { [index: string]: number } = {};

    // Iterate over each report
    reports.forEach((report) => {
      // Iterate over each metric in the report
      report.metrics.forEach((metric) => {
        // If this category hasn't been encountered yet, initialize sums and counts
        if (!categorySums[metric.name]) {
          categorySums[metric.name] = 0;
          categoryCounts[metric.name] = 0;
        }

        // Add the metric value to the sum for this category
        categorySums[metric.name] += metric.score;
        categoryCounts[metric.name] += 1;
      });
    });

    // Now calculate the average for each category
    const avgScores = Object.keys(categorySums).map((category) => {
      return {
        metric_id: MetricNameToId[category as MetricNames],
        name: category as MetricNames,
        score: categorySums[category] / categoryCounts[category],
        evaluated_at: "n/a",
      };
    });

    console.log(avgScores);

    return avgScores;
  }

  React.useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch(
          `/api/report?user=${encodeURIComponent(user?.sub || "")}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch report data");
        }
        const data = await res.json();
        const avgScores = calculateAvgMetrics(data);
        setAvgMetrics(avgScores);
        const analysisData = transformMetricsToAnalysisData(avgScores);
        const rec = generateRecommendations(analysisData);
        setRecommendations(rec);
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoadingReports(false);
      }
    }
    if (isAuthenticated && !isLoading) {
      fetchReports();
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading || loadingReports || !avgMetrics) {
    return (
      <div className="animate-pulse w-full h-full flex flex-col gap-4 rounded-lg p-4 bg-lightGray dark:bg-stone-700 relative overflow-hidden">
        <div className={cn(!short && "font-bold text-lg")} style={outfit.style}>
          Summary statistics
        </div>
        {loadingBubbles.map((loadingBubble) => (
          <div
            className={cn("w-full h-[20px] bg-[#4d4843] rounded-full ")}
            key={loadingBubble}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full h-full">
      {recommendations && (
        <div className="bg-white dark:bg-black p-4 rounded-lg">
          {recommendations.map((rec, i) => (
            <div className="flex gap-2 items-start pb-4" key={`rec${i}`}>
              <Lightbulb className="text-darkCaramel" />
              <p>{rec}</p>
            </div>
          ))}
        </div>
      )}
      <div className="w-full h-full rounded-lg bg-lightGray dark:bg-stone-700 relative overflow-hidden">
        <div
          className={cn("p-4", !short && "font-bold text-lg")}
          style={outfit.style}
        >
          Average Metrics
        </div>
        {avgMetrics.map((metric, i) => {
          const Icon = MetricNameToIcon[metric.name];
          return (
            (!short || i < 3) && (
              <div
                className={cn(
                  "flex items-center gap-8 justify-between px-4 py-2 group",
                  "even:bg-[#e0d7ce]",
                  "dark:even:bg-[#4d4843]"
                )}
                key={metric.metric_id}
              >
                <div className="flex gap-2 items-center">
                  <Icon />
                  <span className="truncate">
                    {MetricNameToDisplay[metric.name]}
                  </span>
                </div>
                <span className="font-bold text-[#33926d]">
                  {metric.score.toFixed(2)}
                </span>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
});

export default Summary;
