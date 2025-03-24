"use client";

import React from "react";
import { GestureMetrics } from "@/lib/types";
import { MetricNames, MetricNameToIcon } from "@/lib/constants";
import { formatMetricName, getColorClass, getMetricStatus } from "../utils";

interface MetricsDisplayProps {
  metrics: GestureMetrics;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics }) => {
  return (
    <div className="space-y-3">
      {Object.entries(metrics).map(([key, value]) => {
        const Icon = MetricNameToIcon[key as MetricNames];
        return (
          <div key={key} className="flex flex-col mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300 capitalize flex items-center gap-2">
                <Icon />
                {formatMetricName(key)}
              </span>
              <span
                className={
                  key === "overallScore"
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
                {key === "overallScore"
                  ? `${value}/100`
                  : getMetricStatus(key, value)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  key === "overallScore"
                    ? "bg-blue-500"
                    : getColorClass(key, value)
                }`}
                style={{
                  width: `${key === "overallScore" ? value : value * 100}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsDisplay;
