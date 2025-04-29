import { OPTIMAL_RANGES } from "@/lib/constants";
import { AnalysisData, MetricData } from "@/lib/types";
import React from "react";
import { outfit } from "@/app/fonts";
import MetricIndicator from "./metric-indicator";
import { cn } from "@/lib/utils";

interface Props {
  analysisData: AnalysisData;
  scroll?: boolean;
}

/**
 * Renders a section with detailed metrics for the analysis data.
 * @param props - The props for the DetailedMetrics component.
 * @returns The rendered detailed metrics section.
 */
const DetailedMetrics = ({ analysisData, scroll }: Props) => {
  return (
    <div className="bg-white dark:bg-stone-800 mt-6 rounded-lg p-4">
      <h3
        style={outfit.style}
        className="text-lg font-semibold mb-4 text-stone-900 dark:text-white"
      >
        Detailed Metrics
      </h3>
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          scroll && "max-h-[600px] overflow-y-scroll",
        )}
      >
        {Object.entries(analysisData).map(([key, value]) => {
          if (
            key === "sessionDuration" ||
            key === "transcript" ||
            key === "OverallScore"
          )
            return null;
          return (
            <MetricIndicator
              key={key}
              name={key as keyof typeof OPTIMAL_RANGES}
              metric={value as MetricData}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DetailedMetrics;
