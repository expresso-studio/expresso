"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import Section from "@/components/section";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "@/components/logout-button";

type ReportItem = {
  presentation_id: string;
  title: string;
  video_url: string;
  created_at: string;
  metrics: {
    metric_id: number;
    name: string;
    score: number;
    evaluated_at: string;
  }[];
};

export default function ReportPage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [reports, setReports] = React.useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
    } catch (err: any) {
        console.error("Error fetching report data:", err);
        setError(err.message || "An error occurred");
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
  if(user){
    return (
    <div className="max-w-3xl mx-auto p-4">
        <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Presentation Reports for {user.nickname}</h1>
            <button 
            onClick={() => window.location.href = "/"}
            className="text-blue-600 hover:underline"
            >
            Back to Home
            </button>
        </div>

        {reports.length === 0 ? (
            <p>No presentations evaluated yet.</p>
        ) : (
            <div className="space-y-4">
            {reports.map(report => (
                <div key={report.presentation_id} className="border p-4 rounded-lg">
                <h2 className="font-bold">{report.title}</h2>
                <p className="text-sm text-gray-600 mb-2">
                    Created: {new Date(report.created_at).toLocaleDateString()}
                </p>
                
                <div className="mt-2">
                    {report.metrics.map(metric => (
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
}
