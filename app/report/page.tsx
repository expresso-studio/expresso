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

//   React.useEffect(() => {
//     async function fetchReports() {
//       try {
//         // Assumes your API returns report data for the user based on their email or Auth0 id.
//         const res = await fetch(
//           `/api/report?user=${encodeURIComponent(user?.sub || "")}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) {
//           throw new Error("Failed to fetch report data");
//         }
//         const data = await res.json();
//         setReports(data);
//     } catch (err: any) {
//         console.error("Error fetching report data:", err);
//         setError(err.message || "An error occurred");
//     } finally {
//         setLoadingReports(false);
//     }
// }
// if (isAuthenticated && !isLoading) {
//     fetchReports();
// }
// }, [isAuthenticated, isLoading, user]);

if (isLoading || loadingReports) {
    return <div>Loading ...</div>;
}

if (!isAuthenticated) {
    return <div>Please log in to view your report.</div>;
}else{
    console.log(user);
}

  return (
    <PageFormat breadCrumbs={[]}>
      <div className="flex justify-between items-center">
        <Heading1 id="report-greeting">
          Hi {user.nickname}! Here is your Presentation Report
        </Heading1>
        <LogoutButton />
      </div>
      <Section id="report" title="Your Presentation Data">
        {error && <p className="text-red-500">{error}</p>}
        {reports.length === 0 ? (
          <p>No report data available. Please evaluate a presentation.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {reports.map((report) => (
              <div
                key={report.presentation_id}
                className="p-4 border rounded-lg shadow bg-lightCoffee dark:bg-darkCoffee"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{report.title}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="font-semibold">Metrics:</p>
                  {report.metrics.length === 0 ? (
                    <p>No metrics available.</p>
                  ) : (
                    <ul className="list-disc list-inside">
                      {report.metrics.map((metric) => (
                        <li key={metric.metric_id} className="mt-1">
                          <span className="font-medium">{metric.name}:</span>{" "}
                          {metric.score} (
                          {new Date(metric.evaluated_at).toLocaleDateString()})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/presentation/${report.presentation_id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
      <div className="mt-8 flex justify-end">
        <Link
          href="/dashboard"
          className="text-lg font-medium text-blue-500 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    </PageFormat>
  );
}
