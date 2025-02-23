import React, { useState, useEffect, useRef } from "react";

function TranscriptionComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    async function initVideo() {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      } catch (error) {
        console.error("Error accessing camera/microphone:", error);
      }
    }
    initVideo();
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
        setTranscript(
          (prev) => prev + data.channel.alternatives[0].transcript + " "
        );
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
    const videoElement = videoRef.current;
    if (!videoElement || !videoElement.srcObject) {
      throw new Error("No video/audio stream available");
    }
    const videoStream = videoElement.srcObject as MediaStream;
    const audioStream = new MediaStream();
    videoStream.getAudioTracks().forEach((track) => {
      audioStream.addTrack(track);
    });
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
      <h1>Live Transcription</h1>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "100%", maxWidth: "600px" }}
      />
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
