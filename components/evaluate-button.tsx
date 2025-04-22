"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HandIcon } from "lucide-react"; // Or another appropriate icon

const EvaluateButton = () => {
  const router = useRouter();

  const handleDirectEvaluate = () => {
    const query = new URLSearchParams([
      ["HandMovement", "false"],
      ["HeadMovement", "false"],
      ["BodyMovement", "false"],
      ["Posture", "false"],
      ["HandSymmetry", "true"],
      ["GestureVariety", "false"],
      ["EyeContact", "false"],
      ["location", "other"],
    ]).toString();

    router.push(`/dashboard/evaluate?${query}`);
  };

  return (
    <Button
      onClick={handleDirectEvaluate}
      className="group text-3xl font-bold px-16 py-12 rounded-lg flex items-center text-white bg-lightCaramel/50 hover:bg-lightCaramel relative overflow-hidden"
    >
      <HandIcon
        className="group-hover:rotate-3 duration-200 mr-2 w-5 h-5"
        size={32}
      />
      Try it out!
    </Button>
  );
};

export default EvaluateButton;
