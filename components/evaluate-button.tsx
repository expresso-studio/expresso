"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MetricNames, MetricNameToIcon } from "@/lib/constants";

interface Props {
  enabledParams: MetricNames[];
}

const EvaluateButton = ({ enabledParams }: Props) => {
  const defaultUrlParams = [
    ["HandMovement", "false"],
    ["HeadMovement", "false"],
    ["BodyMovement", "false"],
    ["Posture", "false"],
    ["HandSymmetry", "false"],
    ["GestureVariety", "false"],
    ["EyeContact", "false"],
    ["location", "other"],
  ];

  const Icon = MetricNameToIcon[enabledParams[0]];

  const urlParams = defaultUrlParams.map((param) =>
    enabledParams.includes(param[0] as MetricNames) ? [param[0], "true"] : param
  );

  const router = useRouter();

  const handleDirectEvaluate = () => {
    const query = new URLSearchParams(urlParams).toString();

    router.push(`/dashboard/evaluate?${query}`);
  };

  return (
    <Button
      onClick={handleDirectEvaluate}
      className="group text-3xl font-bold px-16 py-12 rounded-lg flex items-center text-white bg-lightCaramel/50 hover:bg-lightCaramel relative overflow-hidden"
    >
      <Icon
        className="group-hover:rotate-12 duration-200 mr-2 w-5 h-5 scale-[2]"
        size={128}
      />
      Try it out!
    </Button>
  );
};

export default EvaluateButton;
