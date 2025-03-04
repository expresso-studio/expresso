"use client";

import * as React from "react";
import Recording from "@/components/recording";
import Section from "@/components/section";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import { ReportItemType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PreviousPresentationsSection() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [reports, setReports] = React.useState<ReportItemType[]>([]);
  const [loadingReports, setLoadingReports] = React.useState(true);

  React.useEffect(() => {
    async function fetchReports() {
      try {
        // Assumes your API returns report data for the user based on their email or Auth0 id.
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
      className="pr-0 min-w-[740px] duration-500 "
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
              <>
                <Recording
                  id={""}
                  title={"PUSH ME"}
                  thumbnail={"/example-thumbnail.png"}
                  created_at={""}
                  overallScore={0}
                  loading={true}
                />
                <Recording
                  id={""}
                  title={"CSCE 482 Demo"}
                  thumbnail={"/example-thumbnail.png"}
                  created_at={""}
                  overallScore={0}
                  loading={true}
                  className="delay-75"
                />
                <Recording
                  id={""}
                  title={"PUSH ME"}
                  thumbnail={"/example-thumbnail.png"}
                  created_at={""}
                  overallScore={0}
                  loading={true}
                  className="delay-100"
                />
              </>
            ) : !isAuthenticated ? (
              <div>Must be authenticated.</div>
            ) : user && reports.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <span>No presentations evaluated yet.</span>
              </div>
            ) : (
              user &&
              reports.map(
                (report, i) =>
                  i < 3 && (
                    <Recording
                      key={report.presentation_id}
                      id={""}
                      thumbnail={"/example-thumbnail.png"}
                      overallScore={0}
                      {...report}
                    />
                  )
              )
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
