"use client"

import React, { Suspense, useState } from 'react';
import GestureAnalyzer from './GestureAnalyzer';
import TranscriptionComponent from '@/components/TranscriptionComponent';
import ProtectedRoute from "@/components/protected-route";

export default function Page() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  // const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  
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
  
  // // Toggle developer mode
  // const toggleDeveloperMode = () => {
  //   setIsDeveloperMode(!isDeveloperMode);
  // };

  // Toggle transcript visibility
  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  return (
    <ProtectedRoute>
      <div className="relative flex flex-col items-center w-full min-h-screen p-4">
        <div className="w-full flex justify-end items-center mb-4 gap-2">
          <button
            onClick={toggleTranscript}
            className={`px-2 py-1 text-xs rounded ${
              showTranscript 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            } transition-colors`}
          >
            {showTranscript ? 'Captions: ON' : 'Captions: OFF'}
          </button>
          
          {/* <button
            onClick={toggleDeveloperMode}
            className={`px-2 py-1 text-xs rounded ${
              isDeveloperMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            } transition-colors`}
          >
            {isDeveloperMode ? 'Developer Mode: ON' : 'Developer Mode: OFF'}
          </button> */}
        </div>
        
        <Suspense fallback={<div className="text-center p-8">Loading pose detection...</div>}>
          <GestureAnalyzer 
            isRecording={isRecording}
            transcript={transcript}
            // developerMode={isDeveloperMode}
          />
        </Suspense>
        
        <div className="w-full">
          <TranscriptionComponent 
            onRecordingStateChange={handleRecordingStateChange}
            onTranscriptUpdate={handleTranscriptUpdate}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}