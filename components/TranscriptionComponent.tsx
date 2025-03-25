"use client"

import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";

interface TranscriptionComponentProps {
  onRecordingStateChange: (recording: boolean) => void;
  onTranscriptUpdate?: (transcript: string) => void;
}

const FILLER_WORDS = new Set([
  "uh",
  "um",
  "mhmm",
  "mm-mm",
  "uh-uh",
  "uh-huh",
  "nuh-uh",
  "like",
]);

function TranscriptionComponent({ 
  onRecordingStateChange, 
  onTranscriptUpdate 
}: TranscriptionComponentProps) {
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [fillerWordsStats, setFillerWordsStats] = useState<{ [word: string]: number }>({});
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sessionWPM, setSessionWPM] = useState<number>(0);
  const [maxWPM, setMaxWPM] = useState<number | null>(null);
  const [minWPM, setMinWPM] = useState<number | null>(null);
  const { user } = useAuth0();
  
  // Refs for stable references
  const socketRef = useRef<WebSocket | null>(null);
  const recordingRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio stream on mount
  useEffect(() => {
    async function initAudio() {  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
    initAudio();
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Update the parent component with the transcript when it changes
  useEffect(() => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript);
    }
  }, [transcript, onTranscriptUpdate]);

  // Update recording ref when state changes
  useEffect(() => {
    recordingRef.current = isRecording;
    
    // Start or stop timer based on recording state
    if (isRecording) {
      // Reset and start timer
      setRecordingDuration(0);
      setStartTime(Date.now());
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isRecording]);

  // Calculate WPM
  useEffect(() => {
    if (startTime !== null) {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      if (elapsedMinutes > 0) {
        const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
        const currentWPM = wordCount / elapsedMinutes;
        setSessionWPM(currentWPM);
  
        setMaxWPM((prev) => (prev === null || currentWPM > prev ? currentWPM : prev));
        setMinWPM((prev) => (prev === null || currentWPM < prev ? currentWPM : prev));
      }
    }
  }, [transcript, startTime]);

  // Function to format time (MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Create a new WebSocket connection
  const createWebSocketConnection = (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      setIsConnecting(true);
      
      // Close any existing connection
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (e) {
          console.error("Error closing existing WebSocket:", e);
        }
      }
      
      const ws = new WebSocket("wss://transcriptionwebsocket-production.up.railway.app");
      
      // Set connection timeout
      const timeoutId = setTimeout(() => {
        setIsConnecting(false);
        reject(new Error("WebSocket connection timeout"));
      }, 5000);
      
      ws.addEventListener("open", () => {
        console.log("WebSocket connection established");
        clearTimeout(timeoutId);
        setIsConnecting(false);
        socketRef.current = ws;
        resolve(ws);
      });
      
      ws.addEventListener("error", (error) => {
        console.error("WebSocket connection error:", error);
        clearTimeout(timeoutId);
        setIsConnecting(false);
        reject(error);
      });
      
      ws.addEventListener("close", (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason);
        
        // If connection was closed while recording, stop recording
        if (recordingRef.current) {
          console.log("WebSocket closed during recording, stopping recording");
          stopRecording();
        }
      });
      
      ws.addEventListener("message", (event) => {
        if (!recordingRef.current || !event.data) return;
        
        try {
          const data = JSON.parse(event.data);
          
          if (
            data &&
            data.channel &&
            data.channel.alternatives &&
            data.channel.alternatives[0].transcript
          ) {
            const newText = data.channel.alternatives[0].transcript;
            console.log("Received transcript chunk:", newText);
            
            setTranscript((prev) => {
              const updated = prev + newText + " ";
              return updated;
            });
  
            const words = newText
              .toLowerCase()
              .replace(/[.,?!]/g, "")
              .split(/\s+/);
            
            setFillerWordsStats((prevStats) => {
              const newStats = { ...prevStats };
              words.forEach((word: string) => {
                if (FILLER_WORDS.has(word)) {
                  newStats[word] = (newStats[word] || 0) + 1;
                }
              });
              return newStats;
            });
            
            let countInChunk = 0;
            words.forEach((word: string) => {
              if (FILLER_WORDS.has(word)){
                countInChunk += 1;
              }
            });
  
            setFillerWordCount((prevCount) => prevCount + countInChunk);
          }
        } catch (e) {
          console.error("Error processing WebSocket message:", e);
        }
      });
    });
  };

  const getMicrophone = async (): Promise<MediaRecorder> => {
    if (!audioStream) {
      throw new Error("No audio stream available");
    }
    return new MediaRecorder(audioStream, { mimeType: "audio/webm" });
  };

  const startRecording = async () => {
    try {
      setTranscript("");
      setFillerWordCount(0);
      setFillerWordsStats({});
      setSessionWPM(0);
      setMaxWPM(null);
      setMinWPM(null);
      
      console.log("Establishing WebSocket connection...");
      const ws = await createWebSocketConnection();
      
      console.log("Creating microphone recorder...");
      const mic = await getMicrophone();
      
      mic.onstart = () => {
        console.log("Recording started");
        document.body.classList.add("recording");
      };
      
      mic.onstop = () => {
        console.log("Recording stopped");
        document.body.classList.remove("recording");
      };
      
      mic.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          console.log("Sending audio data to WebSocket");
          ws.send(event.data);
        }
      };
      
      console.log("Starting microphone...");
      mic.start(1000);
      
      setMicrophone(mic);
      setIsRecording(true);
      onRecordingStateChange(true);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopping recording...");
      
      if (microphone) {
        microphone.stop();
      }
      
      // Close WebSocket connection
      if (socketRef.current) {
        socketRef.current.close(1000, "Recording finished");
        socketRef.current = null;
      }
      
      setMicrophone(null);
      setIsRecording(false);
      onRecordingStateChange(false);
      
      try {
        // Save the filler word stats
        const response = await fetch("/api/fillerwords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: user?.sub,
            fillerWordCount: fillerWordCount,
            fillerWordsStats: fillerWordsStats,
            maxWPM: maxWPM,
            minWPM: minWPM,
            sessionWPM: sessionWPM,
          }),
        });
        const data = await response.json();
        console.log("Filler stats posted successfully:", data);
      } catch (error) {
        console.error("Error posting filler stats:", error);
      }
      
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  const handleRecordButtonClick = () => {
    if (isConnecting) return; // Prevent clicking while connecting
    
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* Main UI with transcript
      <div className="mt-4 p-4 border border-gray-300 rounded-lg min-h-[100px] bg-white dark:bg-gray-800 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transcript:</h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {transcript || "Speech will appear here..."}
        </p>
      </div> */}
      
      {/* Recording controls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-4 shadow-lg z-10 w-auto">
        <button 
          onClick={handleRecordButtonClick}
          disabled={isConnecting}
          className={`px-6 py-3 rounded-lg text-lg font-medium 
            ${isConnecting ? 'bg-gray-500 cursor-wait' : 
             isRecording ? 'bg-red-500 hover:bg-red-600' : 
             'bg-[#936648] hover:bg-[#805946]'} 
            text-white transition-colors`}
        >
          {isConnecting ? "Connecting..." : 
           isRecording ? "Stop Recording" : 
           "Start Recording"}
        </button>
      </div>

      {/* Recording Timer */}
      {isRecording && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg z-10 flex items-center">
          <div className="animate-pulse mr-2 h-2 w-2 rounded-full bg-red-500"></div>
          <span className="font-mono">{formatTime(recordingDuration)}</span>
        </div>
      )}
    </div>
  );
}

export default TranscriptionComponent;