"use client";

import React from "react";
import { GestureMetrics } from "@/lib/types";
import { MetricNames, MetricNameToIcon, OPTIMAL_RANGES } from "@/lib/constants";
import { formatMetricName, getColorClass, getMetricStatus } from "../utils";
import MetricBar from "@/components/metric-bar";

interface MetricsDisplayProps {
  metrics: GestureMetrics;
  enabledMetrics?: Record<keyof GestureMetrics, boolean>;
  toggleMetric?: (metric: keyof GestureMetrics) => void;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  metrics,
  enabledMetrics = Object.fromEntries(
    Object.keys(metrics).map((key) => [key, true])
  ) as Record<keyof GestureMetrics, boolean>,
  toggleMetric,
}) => {
  return (
    <div className="space-y-3">
      {Object.entries(metrics).map(([key, value]) => {
        const metricKey = key as keyof GestureMetrics;
        const Icon = MetricNameToIcon[key as MetricNames];
        const enabled = enabledMetrics[metricKey];
        return (
          <div key={key} className="flex flex-col mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300 capitalize flex items-center gap-2">
                {toggleMetric && (
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleMetric(metricKey)}
                    className="form-checkbox"
                  />
                )}
                <Icon />
                {formatMetricName(key)}
              </span>
              {enabled && (
                <span
                  className={
                    key === "OverallScore"
                      ? "text-white font-bold"
                      : getColorClass(key, value) === "bg-blue-500"
                      ? "text-blue-400"
                      : getColorClass(key, value) === "bg-green-500"
                      ? "text-green-400"
                      : getColorClass(key, value) === "bg-amber-500"
                      ? "text-amber-400"
                      : "text-red-400"
                  }
                >
                  {key === "OverallScore"
                    ? `${value}/100`
                    : getMetricStatus(key, value)}
                </span>
              )}
            </div>
            {enabled && key !== "OverallScore" && (
              <MetricBar
                name={key as keyof typeof OPTIMAL_RANGES}
                metric={{ status: getMetricStatus(key, value), value: value }}
                live={true}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MetricsDisplay;
