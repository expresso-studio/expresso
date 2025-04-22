import {
  MetricNames,
  MetricNameToDisplay,
  MetricNameToIcon,
  OPTIMAL_RANGES,
} from "@/lib/constants";
import { MetricData } from "@/lib/types";
import { getWordColorClass, getWordColorHex } from "@/lib/utils";
import React from "react";
import MetricBar from "./metric-bar";

interface Props {
  name: keyof typeof OPTIMAL_RANGES;
  metric: MetricData;
}

const MetricIndicator = ({ name, metric }: Props) => {
  // Get optimal range from constants if available
  const optimalRange = OPTIMAL_RANGES[name];
  const Icon = MetricNameToIcon[name];

  if (!optimalRange) return null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <Icon />
          <h4 className="font-medium text-gray-900 dark:text-white">
            {MetricNameToDisplay[name as MetricNames]}
          </h4>
        </div>
        <span
          className={`font-medium rounded-sm ${getWordColorClass(
            metric.status,
          )}`}
          style={{ color: getWordColorHex(metric.status) }}
        >
          {metric.status} ({(metric.value * 100).toFixed(1)}%)
        </span>
      </div>

      <MetricBar name={name} metric={metric} />

      {/* Explanation of status */}
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {metric.status === "Low" &&
          "Consider increasing this aspect of your presentation."}
        {metric.status === "High" &&
          "Consider reducing this aspect of your presentation."}
        {metric.status === "Normal" &&
          "This aspect of your presentation is within the optimal range."}
        {metric.status === "Good" &&
          "This aspect of your presentation is excellent."}
        {metric.status === "Fair" &&
          "This aspect of your presentation could use some improvement."}
        {metric.status === "Poor" &&
          "This aspect of your presentation needs significant improvement."}
      </p>
    </div>
  );
};

export default MetricIndicator;
