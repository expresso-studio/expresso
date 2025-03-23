import * as React from "react";
import Section from "@/components/section";
import { WPMChart } from "../progress/wpm-chart";
import Summary from "../progress/summary";
import TopFiller from "../progress/top-filler";
import { useAuthUtils } from "@/hooks/useAuthUtils";

export default function ProgressSection() {
  const { user, isAuthenticated, isLoading, error, refreshToken } = useAuthUtils();
  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);
  return (
    <Section
      id="progress"
      title="Progress"
      link={"/dashboard/progress"}
      className="bg-transparent dark:bg-transparent p-0 flex flex-col gap-8"
    >
      <WPMChart />
      <div className="flex flex-col sm:flex-row gap-8">
        <Summary short={true} />
        <TopFiller short={false} />
      </div>
    </Section>
  );
}
