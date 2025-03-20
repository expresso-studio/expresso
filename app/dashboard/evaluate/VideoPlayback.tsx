"use client";

import React, { useRef, useEffect } from 'react';

interface VideoPlaybackProps {
  videoBlob: Blob | null;
  onDownload?: () => void;
}

const VideoPlayback: React.FC<VideoPlaybackProps> = ({ 
  videoBlob,
  onDownload
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoBlob && videoRef.current) {
      // Create object URL from the blob
      const videoUrl = URL.createObjectURL(videoBlob);
      
      // Set the video source
      videoRef.current.src = videoUrl;
      
      // Clean up the object URL when component unmounts
      return () => {
        URL.revokeObjectURL(videoUrl);
      };
    }
  }, [videoBlob]);
  
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
      <div className="mt-2 flex justify-end">
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
      </div>
    </div>
  );
};

export default VideoPlayback;