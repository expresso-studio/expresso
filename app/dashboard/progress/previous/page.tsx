"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { useAuth0 } from "@auth0/auth0-react";
import { ReportItemType } from "@/lib/types";
import Recording from "@/components/recording";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Page() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [reports, setReports] = React.useState<ReportItemType[]>([]);
  const [loadingReports, setLoadingReports] = React.useState(true);

  const loadingDelays = [0, 75, 100, 200, 400];

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
    <PageFormat
      breadCrumbs={[
        { url: "/dashboard/progress", name: "progress" },
        { name: "previous" },
      ]}
    >
      <Heading1 id="previous">Previous Sessions</Heading1>

      <div className="pt-8 flex flex-col sm:flex-row gap-8">
        <div className="bg-lightLatte rounded-md p-4 h-[60vh] w-full sm:w-[20vw]">
          filter
        </div>
        <div className="w-full">
          {isLoading || loadingReports ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingDelays.map((delay) => (
                <Recording
                  id={""}
                  title={"PUSH ME"}
                  thumbnail={"/example-thumbnail.png"}
                  created_at={""}
                  overallScore={0}
                  loading={true}
                  className={cn(`delay-${delay}`)}
                />
              ))}
            </div>
          ) : !isAuthenticated ? (
            <div>Must be authenticated.</div>
          ) : user && reports.length === 0 ? (
            <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
              <span className="text-stone-500 text-lg italic">
                No presentations evaluated yet.
              </span>
              <Image
                src="/cup.svg"
                width={100}
                height={100}
                alt=""
                className="opacity-75"
              ></Image>
            </div>
          ) : (
            user && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reports.map((report) => (
                  <Recording
                    key={report.presentation_id}
                    id={""}
                    thumbnail={"/example-thumbnail.png"}
                    overallScore={0}
                    {...report}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </PageFormat>
  );
}
