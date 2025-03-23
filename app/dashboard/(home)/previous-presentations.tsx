//app/dashboard/previous-presentations
"use client";

import * as React from "react";
import Recording from "@/components/recording";
import Section from "@/components/section";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import { ReportItemType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PreviousPresentationsSection() {
  const { user, isAuthenticated, isLoading } = useAuthUtils();
  const [reports, setReports] = React.useState<ReportItemType[]>([]);
  const [loadingReports, setLoadingReports] = React.useState(true);

  React.useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch(
          `/api/report?user=${encodeURIComponent(user?.sub || "")}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch report data");
        }
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoadingReports(false);
      }
    }
    if (isAuthenticated && !isLoading) {
      fetchReports();
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <Section
      id="previous"
      link={"/dashboard/progress/previous"}
      title="Previous presentations"
      className="pr-0 min-w-[740px] duration-500"
    >
      <div
        className={cn(
          "flex",
          reports.length < 3 ? "justify-start" : "justify-end"
        )}
      >
        <div className="overflow-x-scroll">
          <div className="flex items-center gap-4">
            {isLoading || loadingReports ? (
              <div className="text-center text-gray-500">
                Loading presentations...
              </div>
            ) : !isAuthenticated ? (
              <div>Must be authenticated.</div>
            ) : user && reports.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <span>No presentations evaluated yet.</span>
              </div>
            ) : (
              user &&
              reports.map((report) => (
                <Recording
                  key={report.presentation_id}
                  id={report.presentation_id}
                  title={report.title}
                  thumbnail={"/example-thumbnail.png"}
                  created_at={report.created_at}
                  overallScore={report.metrics?.score || 0}
                  loading={false}
                />
              ))
            )}
            <div aria-hidden={true} className={"max-w-[1rem] opacity-0"}>
              x
            </div>
          </div>
        </div>
        <div
          className={cn(
            reports.length < 3 && "opacity-0",
            "absolute w-[1rem] h-full bg-gradient-to-r from-transparent to-lightGray dark:to-darkGray"
          )}
        ></div>
      </div>
    </Section>
  );
}
