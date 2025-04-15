"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useScript } from "@/context/ScriptContext";
import { AnalysisData, MetricInput } from "@/lib/types";
import { MetricNames } from "@/lib/constants";

interface VideoPlaybackProps {
  videoBlob: Blob | null;
  onDownload?: () => void;
  metrics: AnalysisData;
}

const VideoPlayback: React.FC<VideoPlaybackProps> = ({
  videoBlob,
  onDownload,
  metrics,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, isAuthenticated } = useAuth0();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [title, setTitle] = useState("");
  const { script } = useScript();

  useEffect(() => {
    if (videoBlob && videoRef.current) {
      const videoUrl = URL.createObjectURL(videoBlob);
      videoRef.current.src = videoUrl;
      return () => {
        URL.revokeObjectURL(videoUrl);
      };
    }
  }, [videoBlob]);

  const handleSaveClick = () => {
    setTitle("");
    setShowTitleDialog(true);
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowTitleDialog(false);
    await handleUpload();
  };

  const handleUpload = async () => {
    if (!videoBlob) return;
    if (!isAuthenticated || !user?.sub) {
      console.error("User not authenticated");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const finalTitle = title.trim() || "Untitled Presentation";

      // Step 1: Request a pre-signed URL and register the presentation.
      const signRes = await fetch("/api/sign-s3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.sub,
          title: finalTitle,
        }),
      });
      if (!signRes.ok) {
        throw new Error("Failed to get a pre-signed URL");
      }

      const { signedUrl, videoKey, presentationId } = await signRes.json();

      // Step 2: Upload the video directly to S3 using the pre-signed URL.
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4",
        },
        body: videoBlob,
      });
      if (!uploadRes.ok) {
        throw new Error("Direct upload to S3 failed");
      }
      console.log("Video directly uploaded to S3. Video key:", videoKey);
      console.log("Presentation registered with ID:", presentationId);

      // Step 3: Upload related metadata using the presentationId.
      if (typeof script === "string" && script.trim() !== "") {
        const scriptRes = await fetch("/api/save-script", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.sub,
            presentationId,
            videoKey,
            script,
          }),
        });
        if (!scriptRes.ok) {
          throw new Error("Script upload failed");
        }
        const { scriptId } = await scriptRes.json();
        console.log("Script saved successfully. ID:", scriptId);
      } else {
        console.warn("Script not saved. Missing script content.");
      }

      if (metrics?.transcript) {
        const transcriptRes = await fetch("/api/upload-transcript", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.sub,
            presentationId,
            videoKey,
            transcript: metrics.transcript,
          }),
        });
        if (!transcriptRes.ok) {
          throw new Error("Transcript upload failed");
        }
        const transcriptData = await transcriptRes.json();
        console.log("Transcript uploaded, ID:", transcriptData.transcriptId);
      } else {
        console.warn("No transcript provided.");
      }

      if (metrics) {
        const metricsToSend: MetricInput[] = [
          {
            name: MetricNames.HandSymmetry,
            value: Math.min(1, Math.max(0, metrics.HandMovement.value)),
          },
          {
            name: MetricNames.HeadMovement,
            value: Math.min(1, Math.max(0, metrics.HeadMovement.value)),
          },
          {
            name: MetricNames.BodyMovement,
            value: Math.min(1, Math.max(0, metrics.BodyMovement.value)),
          },
          {
            name: MetricNames.Posture,
            value: Math.min(1, Math.max(0, metrics.Posture.value)),
          },
          {
            name: MetricNames.HandSymmetry,
            value: Math.min(1, Math.max(0, metrics.HandSymmetry.value)),
          },
          {
            name: MetricNames.GestureVariety,
            value: Math.min(1, Math.max(0, metrics.GestureVariety.value)),
          },
          {
            name: MetricNames.EyeContact,
            value: Math.min(1, Math.max(0, metrics.EyeContact.value)),
          },
          {
            name: MetricNames.OverallScore,
            value: Math.min(1, Math.max(0, metrics.OverallScore)),
          },
        ];

        const metricsRes = await fetch("/api/presentation/metrics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            presentationId,
            userId: user.sub,
            videoKey,
            metrics: metricsToSend,
          }),
        });
        if (!metricsRes.ok) {
          const errorData = await metricsRes.json();
          throw new Error(
            `Failed to save metrics: ${errorData.error || "Unknown error"}`
          );
        }
        const metricsData = await metricsRes.json();
        console.log("Metrics saved successfully:", metricsData);
      }

      console.log("Upload and registration complete.");
      setUploadSuccess(true);
    } catch (error) {
      console.error("Error during upload:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload video or save metadata."
      );
    } finally {
      setUploading(false);
    }
  };

  if (!videoBlob) {
    return (
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium">No video recording available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <video
        ref={videoRef}
        className="w-full rounded-lg border dark:border-gray-700"
        controls
        playsInline
      />
      <div className="mt-2 flex justify-end space-x-2">
        <a
          href={URL.createObjectURL(videoBlob)}
          download="presentation-recording.mp4"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          onClick={() => onDownload && onDownload()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Video
        </a>
        <button
          onClick={handleSaveClick}
          disabled={uploading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          {uploading ? "Saving..." : "Save Video"}
        </button>
      </div>
      {uploadError && <p className="mt-2 text-red-500">{uploadError}</p>}
      {uploadSuccess && (
        <p className="mt-2 text-green-500">Video saved successfully!</p>
      )}
      {showTitleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              Enter Presentation Title
            </h3>
            <form onSubmit={handleTitleSubmit}>
              <input
                type="text"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-4"
                placeholder="Presentation Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTitleDialog(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayback;
