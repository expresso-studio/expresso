"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";

interface MetricData {
  value: number;
  status: string;
}

interface VideoPlaybackProps {
  videoBlob: Blob | null;
  onDownload?: () => void;
  metrics: {
    handMovement: MetricData;
    headMovement: MetricData;
    bodyMovement: MetricData;
    posture: MetricData;
    handSymmetry: MetricData;
    gestureVariety: MetricData;
    eyeContact: MetricData;
    overallScore: number;
    sessionDuration: number;
    transcript: string;
  };
}

const VideoPlayback: React.FC<VideoPlaybackProps> = ({ videoBlob, onDownload, metrics }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, isAuthenticated } = useAuth0();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (videoBlob && videoRef.current) {
      // Create an object URL from the blob
      const videoUrl = URL.createObjectURL(videoBlob);
      videoRef.current.src = videoUrl;
      // Clean up the object URL when the component unmounts
      return () => {
        URL.revokeObjectURL(videoUrl);
      };
    }
  }, [videoBlob]);

  const handleSaveClick = () => {
    setTitle(""); // Reset title
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
      console.error('User not authenticated');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('video', videoBlob, 'presentation-recording.mp4');

    try {
      const finalTitle = title.trim() || "Untitled Presentation";
      const res = await fetch(
        `/api/upload-video?user=${encodeURIComponent(user.sub)}&title=${encodeURIComponent(finalTitle)}`, 
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      const { videoUrl, presentationId } = await res.json();

      // Upload transcript if available
      if (metrics?.transcript && presentationId) {
        const transcriptRes = await fetch('/api/upload-transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.sub,
            presentationId,
            transcript: metrics.transcript,
          }),
        });

        if (!transcriptRes.ok) {
          throw new Error('Transcript upload failed');
        }

        const transcriptData = await transcriptRes.json();
        console.log('Transcript uploaded, ID:', transcriptData.transcriptId);
      } else {
        console.warn("No transcript provided or missing presentationId.");
      }
      
      console.log('Video uploaded, URL:', videoUrl, 'ID:', presentationId);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error during video upload:', error);
      setUploadError('Failed to upload video.');
    } finally {
      setUploading(false);
    }
  };

  if (!videoBlob) {
    return (
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
      {uploadSuccess && <p className="mt-2 text-green-500">Video saved successfully!</p>}

      {/* Title Dialog */}
      {showTitleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Enter Presentation Title</h3>
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