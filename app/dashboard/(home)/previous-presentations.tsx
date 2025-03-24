//app/dashboard/previous-presentations
"use client";

import * as React from "react";
import Recording from "@/components/recording";
import Section from "@/components/section";
import { useAuthUtils } from "@/hooks/useAuthUtils";
import { ReportItemType } from "@/lib/types";
import { cn } from "@/lib/utils";

// A simple modal component that renders its children as an overlay.
const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white p-4 rounded shadow-lg max-w-full w-[90%]">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

interface VideoPlayerProps {
  videoKey: string; // This is now the S3 object key
  title: string;
  userId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoKey, title, userId }) => {
  const [signedUrl, setSignedUrl] = React.useState<string>("");

  React.useEffect(() => {
    if (!videoKey || !userId) return;
    const fetchSignedUrl = async () => {
      try {
        const res = await fetch(
          `/api/get-signed-url?videoKey=${encodeURIComponent(videoKey)}&user=${encodeURIComponent(userId)}`
        );
        if (!res.ok) {
          console.error("Failed to fetch signed URL, status:", res.status);
          return;
        }
        const data = await res.json();
        setSignedUrl(data.url);
      } catch (error) {
        console.error("Error fetching signed URL", error);
      }
    };
    fetchSignedUrl();
  }, [videoKey, userId]);

  if (!signedUrl) {
    return <div>Loading video...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <video className="w-full" controls>
        <source src={signedUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};


export default function PreviousPresentationsSection() {
  const { user, isAuthenticated, isLoading } = useAuthUtils();
  const [reports, setReports] = React.useState<ReportItemType[]>([]);
  const [loadingReports, setLoadingReports] = React.useState(true);
  const [selectedReport, setSelectedReport] =
    React.useState<ReportItemType | null>(null);

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

  const handleCardClick = (report: ReportItemType) => {
    setSelectedReport(report);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

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
                <div
                  key={report.presentation_id}
                  onClick={() => handleCardClick(report)}
                  className="cursor-pointer block"
                >
                  <Recording
                    id={report.presentation_id}
                    title={report.title} // Display the presentation title
                    thumbnail={"/example-thumbnail.png"}
                    created_at={report.created_at}
                    overallScore={report.metrics?.score || 0}
                    loading={false}
                  />
                </div>
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
      {selectedReport && user && (
        <Modal onClose={closeModal}>
          <VideoPlayer
            videoKey={selectedReport.video_url}
            title={selectedReport.title}
            userId={user.sub!}
          />
        </Modal>
      )}
    </Section>
  );
}
