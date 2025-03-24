"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import { ReportItemType } from "@/lib/types";
import Recording from "@/components/recording";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-route";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [loadingReports, setLoadingReports] = React.useState(true);

  // New state for filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateRange, setDateRange] = React.useState("all");
  const [scoreRange, setScoreRange] = React.useState({ min: "", max: "" });
  const [sortBy, setSortBy] = React.useState("date-desc");
  const [filteredReports, setFilteredReports] =
    React.useState<ReportItemType[]>(reports);

  // Filter logic
  const applyFilters = () => {
    let filtered = [...reports];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((report) =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    const now = new Date();
    if (dateRange !== "all") {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.created_at);
        const diffTime = now.getTime() - reportDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);

        switch (dateRange) {
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          case "3months":
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }

    // Score filter
    if (scoreRange.min !== "") {
      filtered = filtered.filter(
        (report) => report.metrics.score >= Number(scoreRange.min)
      );
    }
    if (scoreRange.max !== "") {
      filtered = filtered.filter(
        (report) => report.metrics.score <= Number(scoreRange.max)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date-asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "score-desc":
          return b.metrics.score - a.metrics.score;
        case "score-asc":
          return a.metrics.score - b.metrics.score;
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
  };

  const loadingDelays = [0, 75, 100, 200, 400];

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
        setFilteredReports(data);
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
      <PageFormat
        breadCrumbs={[
          { url: "/dashboard/progress", name: "progress" },
          { name: "previous" },
        ]}
      >
        <Heading1 id="previous">Previous Sessions</Heading1>

        <div className="pt-8 flex flex-col sm:flex-row gap-8">
          <div className="bg-lightLatte dark:bg-darkCoffee rounded-md p-4 h-[60vh] w-full sm:w-[20vw] flex flex-col gap-4">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search by title..."
                className="w-full px-3 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="3months">Past 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Score Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 border rounded-md"
                    min="0"
                    max="100"
                    value={scoreRange.min}
                    onChange={(e) =>
                      setScoreRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 border rounded-md"
                    min="0"
                    max="100"
                    value={scoreRange.max}
                    onChange={(e) =>
                      setScoreRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="score-desc">Highest Score</SelectItem>
                    <SelectItem value="score-asc">Lowest Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-lightCoffee text-white py-2 rounded-md hover:bg-[#805946]"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
          <div className="w-full">
            {isLoading || loadingReports ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {loadingDelays.map((delay, i) => (
                  <Recording
                    key={i}
                    id={""}
                    title={"blank"}
                    created_at={""}
                    metrics={null}
                    loading={true}
                    className={cn(`delay-${delay}`)}
                    video_url={""}
                  />
                ))}
              </div>
            ) : !isAuthenticated ? (
              <div>Must be authenticated.</div>
            ) : user && filteredReports.length === 0 ? (
              <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
                <span className="text-stone-500 text-lg italic">
                  {reports.length === 0
                    ? "No presentations evaluated yet."
                    : "No presentations with selected filters found."}
                </span>
                <Image
                  src="/cup.svg"
                  width={100}
                  height={100}
                  alt=""
                  className="opacity-75"
                />
              </div>
            ) : (
              user && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredReports.map((report) => (
                    <Recording
                      key={report.presentation_id}
                      id={report.presentation_id}
                      {...report}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </PageFormat>
    </ProtectedRoute>
  );
}
