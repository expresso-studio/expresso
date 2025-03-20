"use client"

import React, { Suspense, useState } from 'react';
import GestureAnalyzer from './GestureAnalyzer';
import TranscriptionComponent from '@/components/TranscriptionComponent';
import ProtectedRoute from "@/components/protected-route";
import { useAuthUtils } from "@/hooks/useAuthUtils";

export default function Page() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isDeveloperMode, setIsDeveloperMode] = useState(true); // Default to true for developer
  const { user, isAuthenticated, isLoading, error, refreshToken } = useAuthUtils();
    
  // If there's an auth error, try to refresh the token
  React.useEffect(() => {
    if (error) {
      console.error("Auth error in dashboard:", error);
      refreshToken();
    }
  }, [error, refreshToken]);
  
  // Handle recording state changes from the TranscriptionComponent
  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording);
  };
  
  // Handle transcript updates from the TranscriptionComponent  
  const handleTranscriptUpdate = (newTranscript: string) => {
    setTranscript(newTranscript);
  };
  
  // Handle stop recording request from the GestureAnalyzer
  const handleStopRecording = () => {
    setIsRecording(false);
  };
  
  // Toggle developer mode
  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
  };

  return (
    <ProtectedRoute>
    <div className="relative flex flex-col items-center p-4">
      <div className="w-full flex justify-between items-center mb-6">
        
        <button
          onClick={toggleDeveloperMode}
          className={`px-3 py-1 rounded text-sm ${
            isDeveloperMode 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          } transition-colors`}
        >
          {isDeveloperMode ? 'Developer Mode: ON' : 'Developer Mode: OFF'}
        </button>
      </div>
      
      <Suspense fallback={<div className="text-center p-8">Loading pose detection...</div>}>
        <GestureAnalyzer 
          isRecording={isRecording}
          onStopRecording={handleStopRecording}
          transcript={transcript}
          developerMode={isDeveloperMode}
        />
      </Suspense>
      
      <div className="w-full max-w-[1200px] mt-8">
        <TranscriptionComponent 
          onRecordingStateChange={handleRecordingStateChange}
          onTranscriptUpdate={handleTranscriptUpdate}
        />
      </div>
    </div>
    </ProtectedRoute>
  );
}