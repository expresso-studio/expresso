import * as React from "react";
import Section from "@/components/section";
import { WPMChart } from "../progress/wpm-chart";
import Summary from "../progress/summary";
import TopFiller from "../progress/top-filler";
// import { useAuthUtils } from "@/hooks/useAuthUtils";

/**
 * ProgressSection component that renders the progress section on the dashboard page.
 * @returns {JSX.Element} The JSX element representing the progress section.
 */
export default function ProgressSection() {
  //use this auth stuff once we start doing things on this page
  // const { user, isAuthenticated, isLoading, error, refreshToken } = useAuthUtils();
  // // If there's an auth error, try to refresh the token
  // React.useEffect(() => {
  //   if (error) {
  //     console.error("Auth error in dashboard:", error);
  //     refreshToken();
  //   }
  // }, [error, refreshToken]);
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
