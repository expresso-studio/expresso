import React from "react";
import { statistic } from "@/lib/types";
import { IoHandLeft, IoSpeedometer } from "react-icons/io5";
import { BiCheckDouble, BiSolidSmile } from "react-icons/bi";
import { cn } from "@/lib/utils";

// TODO: remove dummy values
const statistics: statistic[] = [
  {
    icon: <IoHandLeft />,
    text: "Hand gestures",
    status: 20,
  },
  {
    icon: <BiCheckDouble />,
    text: "Accuracy",
    status: 2,
  },
  {
    icon: <BiSolidSmile />,
    text: "Facial expressions",
    status: -4,
  },
  {
    icon: <IoSpeedometer />,
    text: "WPM",
    status: -30,
  },
];

interface Props {
  short?: boolean;
}

const Summary = React.memo<Props>(function Summary({ short }) {
  return (
    <div className="w-full rounded-lg bg-lightGray dark:bg-stone-700 relative overflow-hidden">
      <div className="p-4">Summary statistics</div>
      {statistics.map(
        (statistic, i) =>
          (!short || i < 3) && (
            <div
              className={cn(
                "flex items-center gap-8 justify-between px-4 py-2 group",
                "even:bg-[#e0d7ce]",
                "dark:even:bg-[#4d4843]"
              )}
              key={i}
            >
              <span className="flex gap-2 items-center group-hover:translate-x-1 duration-150 truncate">
                {statistic.icon}
                <span className="truncate">{statistic.text}</span>
              </span>
              <span
                className={cn(
                  "group-hover:translate-x-1 duration-150 font-bold",
                  statistic.status > 0 ? "text-[#33926d]" : "text-[#bd5626]"
                )}
              >
                {statistic.status}%
              </span>
            </div>
          )
      )}
    </div>
  );
});

export default Summary;
