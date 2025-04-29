import React from "react";
import { generateRecommendations } from "@/lib/utils";
import { AnalysisData } from "@/lib/types";
import { outfit } from "@/app/fonts";

interface Props {
  analysisData: AnalysisData;
}

/**
 * Renders a section with key recommendations based on the analysis data.
 * @param props - The props for the KeyRecommendations component.
 * @returns The rendered key recommendations section.
 */
const KeyRecommendations = ({ analysisData }: Props) => {
  const recommendations = generateRecommendations(analysisData);

  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg p-4 dark:-stone-700">
      <h3
        style={outfit.style}
        className="text-lg font-semibold mb-2 text-stone-900 dark:text-white"
      >
        Key Recommendations
      </h3>
      <ul className="list-disc pl-5 space-y-1 text-stone-700 dark:text-stone-300">
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default KeyRecommendations;
