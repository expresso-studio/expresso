"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MetricNames, MetricNameToIcon } from "@/lib/constants";
import { useState } from "react";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import React from "react";

interface Props {
  enabledParams: MetricNames[];
  lessonId: number;
}

const EvaluateButton = ({ enabledParams, lessonId }: Props) => {
  const { user, isAuthenticated, isLoading, error, refreshToken } =
    useAuthUtils();

  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);

  const [isSendingLoading, setIsSendingLoading] = useState(false);

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

  const handleDirectEvaluate = async () => {
    try {
      setIsSendingLoading(true);

      const userId = user?.sub;
      // First, mark the lesson as complete
      const response = await fetch("/api/complete-lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, lessonId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error completing lesson:", errorData);
        // Continue to evaluation even if lesson completion fails
      }

      // Then navigate to the evaluation page
      const query = new URLSearchParams(urlParams).toString();
      router.push(`/dashboard/evaluate?${query}`);
    } catch (error) {
      console.error("Error during lesson completion:", error);
      // Continue to evaluation even if there's an error
      const query = new URLSearchParams(urlParams).toString();
      router.push(`/dashboard/evaluate?${query}`);
    } finally {
      setIsSendingLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDirectEvaluate}
      className="group text-3xl font-bold px-16 py-12 rounded-lg flex items-center text-white bg-lightCaramel/75 hover:bg-lightCaramel relative overflow-hidden"
      disabled={isLoading}
    >
      <Icon
        className="group-hover:rotate-12 duration-200 mr-2 w-5 h-5 scale-[2]"
        size={128}
      />
      {isLoading || isSendingLoading ? "Loading..." : "Try it out!"}
    </Button>
  );
};

export default EvaluateButton;
