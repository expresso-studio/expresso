import { OPTIMAL_RANGES } from "@/lib/constants";
import { MetricData } from "@/lib/types";
import { cn, getWordColorClass } from "@/lib/utils";
import React from "react";

interface Props {
  name: keyof typeof OPTIMAL_RANGES;
  metric: MetricData;
  live?: boolean;
}

const MetricBar = React.memo(function MetricBarFunction({
  name,
  metric,
  live,
}: Props) {
  // Skip non-metric fields and overall score (already displayed)

  // Get optimal range from constants if available
  const optimalRange = OPTIMAL_RANGES[name];

  if (!optimalRange) return null;

  // Calculate positions for visualization (as percentage of bar width)
  const minPosition = optimalRange.min * 100;
  const maxPosition = optimalRange.max * 100;
  const currentPosition = metric.value * 100;

  return (
    <div
      className={cn(
        "relative w-full h-5 bg-orange-200 dark:bg-darkCaramel rounded-full mt-1",
        live && "h-2"
      )}
    >
      {/* Optimal range zone */}
      <div
        className="absolute h-full bg-[#98aa57] dark:bg-green-900 rounded-full opacity-50"
        style={{
          left: `${minPosition}%`,
          width: `${maxPosition - minPosition}%`,
        }}
      ></div>
      <div
        className="absolute h-full bg-[#98aa57] dark:bg-green-900 rounded-full opacity-50"
        style={{
          left: `${minPosition + 0.25 * (maxPosition - minPosition)}%`,
          width:
            name === "Posture"
              ? `${0.75 * (maxPosition - minPosition)}%`
              : `${0.5 * (maxPosition - minPosition)}%`,
        }}
      ></div>

      {/* Min and max labels */}
      {!live && (
        <>
          <div
            className="absolute -bottom-5 text-xs text-gray-500 dark:text-gray-400"
            style={{ left: `${minPosition}%` }}
          >
            {optimalRange.min.toFixed(2)}
          </div>
          <div
            className="absolute -translate-x-5 -bottom-5 text-xs text-gray-500 dark:text-gray-400"
            style={{ left: `${maxPosition}%` }}
          >
            {optimalRange.max.toFixed(2)}
          </div>
        </>
      )}

      {/* Current value marker */}
      {!live ? (
        <div
          className={`absolute top-0 w-2 h-5 rounded-sm ${getWordColorClass(
            metric.status
          ).replace("text-", "bg-")}`}
          style={{ left: `calc(${currentPosition}% - 4px)` }}
        ></div>
      ) : (
        <div
          className={`absolute top-0 -translate-y-1 w-2 h-4 rounded-sm ${getWordColorClass(
            metric.status
          ).replace("text-", "bg-")}`}
          style={{ left: `calc(${currentPosition}% - 4px)` }}
        ></div>
      )}
    </div>
  );
});

export default MetricBar;
