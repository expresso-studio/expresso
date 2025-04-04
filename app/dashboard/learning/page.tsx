"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { MetricType, ReportItemType } from "@/lib/types";
import Recording from "@/components/recording";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import Recommendations from "./recommendations";

export default function Page() {
  const { user, isAuthenticated, isLoading, error, refreshToken } =
    useAuthUtils();

  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);
  const [reports, setReports] = React.useState<ReportItemType[]>([]);
  const [metrics, setMetrics] = React.useState<MetricType[]>([]);
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
        setMetrics(data.filter((report: ReportItemType) => report.metrics));
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
    <ProtectedRoute>
      <PageFormat breadCrumbs={[{ name: "learning" }]}>
        <Heading1 id="learning">Learning</Heading1>
        <div className="w-full flex">
          <Recommendations
            loading={loadingReports}
            metrics={metrics}
            courses={[]}
          />
        </div>
      </PageFormat>
    </ProtectedRoute>
  );
}
