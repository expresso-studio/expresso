import React from "react";
import { cn } from "@/lib/utils";
import { outfit } from "@/app/fonts";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface Props {
  short?: boolean;
}

const TopFiller = React.memo<Props>(function TopFiller({ short }) {
  const [fillerWords, setFillerWords] = useState<string[]>(["um", "like", "but"]);
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    const fetchTopFillerWords = async () => {
      if (!isAuthenticated || !user?.sub) {
        console.error('User not authenticated');
        return;
      }

      try {
        const response = await fetch(`/api/fillerwords/top?userId=${encodeURIComponent(user.sub)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch filler words");
        }

        const data = await response.json();
        const words = data.fillerWords.map(
          (item: { filler_word: string; total_count: string }) => item.filler_word
        );
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
