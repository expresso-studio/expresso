"use client";

import React, { Suspense, useState } from "react";
import GestureAnalyzer from "./GestureAnalyzer";
import TranscriptionComponent from "@/components/TranscriptionComponent";
import ProtectedRoute from "@/components/protected-route";
import { FillerStats } from "./gesture-analysis";

export default function Page() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [fillerStats, setFillerStats] = useState<FillerStats | null>(null);

  // Handle filler stats from TranscriptionComponent
  const handleFillerStats = (stats: FillerStats) => {
    setFillerStats(stats);
  };

  // Handle recording state changes from the TranscriptionComponent
  const handleRecordingStateChange = (recording: boolean) => {
    // Only clear transcript when recording starts, not when it stops
    if (recording) {
      setTranscript("");
    }
    setIsRecording(recording);
  };

  // Handle transcript updates from the TranscriptionComponent
  const handleTranscriptUpdate = (newTranscript: string) => {
    // Always update the transcript when recording, regardless of the showTranscript setting
    if (isRecording) {
      setTranscript(newTranscript);
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative flex flex-col items-center w-full min-h-screen p-4">
        <Suspense
          fallback={
            <div className="text-center p-8">Loading pose detection...</div>
          }
        >
          <GestureAnalyzer
            isRecording={isRecording}
            transcript={transcript}
            fillerStats={fillerStats}
            // developerMode={isDeveloperMode}
          />
        </Suspense>

        <div className="w-full">
          <TranscriptionComponent
            onRecordingStateChange={handleRecordingStateChange}
            onTranscriptUpdate={handleTranscriptUpdate}
            onFillerStats={handleFillerStats} // Pass filler stats handler
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
