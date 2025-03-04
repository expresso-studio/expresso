import React from "react";
import { cn } from "@/lib/utils";
import { outfit } from "@/app/fonts";
import { useEffect, useState } from "react";

interface Props {
  short?: boolean;
}

const TopFiller = React.memo<Props>(function TopFiller({ short }) {
  const [fillerWords, setFillerWords] = useState<string[]>(["um", "like", "but"]);

  useEffect(() => {
    const fetchTopFillerWords = async () => {
      try {
        const response = await fetch("/api/fillerwords/top");
        if (!response.ok) {
          throw new Error("Failed to fetch filler words");
        }
        // Assume the API returns JSON in the format: { fillerWords: string[] }
        const data = await response.json();
        const words = data.fillerWords.map(
          (item: { filler_word: string; total_count: string }) => item.filler_word
        );
        console.log(words);
        setFillerWords(words.slice(0, 3));
      } catch (error) {
        console.error("Error fetching filler words:", error);
      }
    };

    fetchTopFillerWords();
  }, []);

  return (
    <div
      className={cn(
        "w-full rounded-lg relative overflow-hidden py-4 px-6",
        "bg-lightLatte dark:bg-darkCoffee"
      )}
    >
      <div className="pb-4">Most frequent filler words</div>
      <div className="flex items-start justify-between">
        {fillerWords.map(
          (fillerWord, i) =>
            (!short || i < 1) && (
              <div
                className={cn(
                  "flex rounded-md items-start gap-1 group",
                  outfit.className
                )}
                key={i}
              >
                <span className="text-[#f9cca5] font-bold text-xl">
                  {i + 1}
                </span>
                <span className="text-white font-bold text-4xl translate-y-2">
                  {fillerWord}
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
});

export default TopFiller;
