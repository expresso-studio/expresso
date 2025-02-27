"use client"

import { fill } from "@tensorflow/tfjs";
import React, { useState, useEffect } from "react";

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

function TranscriptionComponent() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [fillerWordsStats, setFillerWordsStats] = useState<{ [word: string]: number }>({});

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

  useEffect(() => {
    // Connect to our WebSocket server on port 3001.
    const ws = new WebSocket("ws://localhost:3001");
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
    console.log(fillerWordCount)
    console.log(fillerWordsStats)
    mic.stop();
  };

  const handleRecordButtonClick = async () => {
    if (!socket) {
      console.error("WebSocket not ready. Cannot record.");
      return;
    }
    if (!microphone) {
      try {
        const mic = await getMicrophone();
        await openMicrophone(mic, socket);
        setMicrophone(mic);
        setIsRecording(true);
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
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginTop: "1rem" }}>
        <button id="record" onClick={handleRecordButtonClick}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
      <div
        id="captions"
        style={{
          marginTop: "1rem",
          padding: "1rem",
          border: "1px solid #ccc",
          minHeight: "3rem",
        }}
      >
        <strong>Transcript:</strong>
        <p>{transcript}</p>
      </div>
    </div>
  );
}

export default TranscriptionComponent;
