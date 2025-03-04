"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { ReportItemType } from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [reports, setReports] = React.useState<ReportItemType[]>([]);
  const [loadingReports, setLoadingReports] = React.useState(true);

  // Redirect to login if not authenticated.
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  // Fetch reports after authentication is ready.
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

  if (isLoading || loadingReports) {
    return <div>Loading ...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your report.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Presentation Reports for {user?.nickname}
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>

      {reports.length === 0 ? (
        <p>No presentations evaluated yet.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.presentation_id} className="border p-4 rounded-lg">
              <h2 className="font-bold">{report.title}</h2>
              <p className="text-sm text-gray-600 mb-2">
                Created: {new Date(report.created_at).toLocaleDateString()}
              </p>
              <div className="mt-2">
                {report.metrics.map((metric) => (
                  <div key={metric.metric_id} className="flex justify-between py-1">
                    <span>{metric.name}:</span>
                    <span className="font-medium">{metric.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
