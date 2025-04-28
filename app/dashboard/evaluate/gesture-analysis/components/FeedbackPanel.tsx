"use client";

import React, { useState } from "react";
import { GestureFeedback } from "@/lib/types";

interface FeedbackPanelProps {
  feedback: GestureFeedback[];
  isRecording: boolean;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedback,
  isRecording,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isRecording) return null;

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-white text-sm font-medium">Real-time Feedback</h4>
        <button
          onClick={toggleVisibility}
          className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors"
        >
          {isVisible ? "Hide" : "Show"} Feedback
        </button>
      </div>

      {isVisible && (
        <>
          {feedback.length > 0 ? (
            <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600 space-y-2">
              {feedback.map((item, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded ${
                    item.type === "success"
                      ? "bg-green-800/30 text-green-300"
                      : item.type === "warning"
                        ? "bg-yellow-800/30 text-yellow-300"
                        : item.type === "error"
                          ? "bg-red-800/30 text-red-300"
                          : "bg-blue-800/30 text-blue-300"
                  }`}
                >
                  {item.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-gray-700/50 border border-gray-600">
              <p className="text-sm text-gray-400">
                No feedback available yet. Continue speaking...
              </p>
            </div>
          )}

          <div className="mt-4 pt-2 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">System Analysis</span>
              <span className="text-xs text-blue-400">
                {feedback.length > 0 ? "Analyzing..." : "Waiting for data..."}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackPanel;
