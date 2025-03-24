"use client"

import React, { useState, useEffect } from "react";

interface TranscriptionComponentProps {
  onRecordingStateChange: (recording: boolean) => void;
  onTranscriptUpdate?: (transcript: string) => void; // Add this prop
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
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [fillerWordsStats, setFillerWordsStats] = useState<{ [word: string]: number }>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sessionWPM, setSessionWPM] = useState<number>(0);
  const [maxWPM, setMaxWPM] = useState<number | null>(null);
  const [minWPM, setMinWPM] = useState<number | null>(null);

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
  }, []);

  // Update the parent component with the transcript when it changes
  useEffect(() => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript);
    }
  }, [transcript, onTranscriptUpdate]);

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
  }, [transcript]);

  useEffect(() => {
    // Connect to our WebSocket server on port 3001.
    const ws = new WebSocket("wss://transcriptionwebsocket-production.up.railway.app");
    ws.addEventListener("open", () => {
      console.log("client: connected to server");
    });
    ws.addEventListener("message", (event) => {
      if (!event.data) return;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return;
      }
      if (
        data &&
        data.channel &&
        data.channel.alternatives &&
        data.channel.alternatives[0].transcript
      ) {
        const newText = data.channel.alternatives[0].transcript;
        setTranscript((prev) => prev + newText + " ");

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
    });
    ws.addEventListener("close", () => {
      console.log("client: disconnected from server");
    });
    setSocket(ws);
    return () => {
      ws.close();
    };
  }, []);

  const getMicrophone = async (): Promise<MediaRecorder> => {
    if (!audioStream) {
      throw new Error("No audio stream available");
    }
    return new MediaRecorder(audioStream, { mimeType: "audio/webm" });
  };

  const openMicrophone = (mic: MediaRecorder, ws: WebSocket) => {
    return new Promise<void>((resolve) => {
      mic.onstart = () => {
        console.log("client: microphone opened");
        document.body.classList.add("recording");
        resolve();
      };
      mic.onstop = () => {
        console.log("client: microphone closed");
        document.body.classList.remove("recording");
      };
      mic.ondataavailable = (event) => {
        console.log("client: microphone data received");
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };
      mic.start(1000);
    });
  };

  const closeMicrophone = async (mic: MediaRecorder) => {
    mic.stop();

     try {
      const response = await fetch("/api/fillerwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: "auth0|67baac4182c20de0c41b0395", // TODO: Fix with actual user id
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
  };

  const handleRecordButtonClick = async () => {
    if (!socket) {
      console.error("WebSocket not ready. Cannot record.");
      return;
    }
    if (!microphone) {
      try {
        setStartTime(Date.now());
        setTranscript("");
        setSessionWPM(0);
        setMaxWPM(null);
        setMinWPM(null);
        const mic = await getMicrophone();
        await openMicrophone(mic, socket);
        setMicrophone(mic);
        setIsRecording(true);
        onRecordingStateChange(true);
      } catch (error) {
        console.error("Error opening microphone:", error);
      }
    } else {
      try {
        await closeMicrophone(microphone);
      } catch (error) {
        console.error("Error stopping microphone:", error);
      }
      setMicrophone(null);
      setIsRecording(false);
      onRecordingStateChange(false);
    }
  };


  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={handleRecordButtonClick}
          className={`px-4 py-2 rounded ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        
       
      </div>
      
      <div className="mt-4 p-4 border border-gray-300 rounded-lg min-h-[100px] bg-white dark:bg-gray-800 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transcript:</h3>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {transcript || "Speech will appear here..."}
        </p>
      </div>
    </div>
  );
}

export default TranscriptionComponent;