import React, { useState, useEffect, useRef } from "react";

function TranscriptionComponent() {
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [microphone, setMicrophone] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // 1. Set up the video stream on mount
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

  // 2. Set up WebSocket on mount
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

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

      // Adjust to your server’s JSON structure:
      // Here, we assume: data.channel.alternatives[0].transcript
      if (
        data &&
        data.channel &&
        data.channel.alternatives &&
        data.channel.alternatives[0].transcript
      ) {
        setTranscript(data.channel.alternatives[0].transcript);
      }
    });

    ws.addEventListener("close", () => {
      console.log("client: disconnected from server");
    });

    setSocket(ws);

    // Cleanup WebSocket on unmount
    return () => {
      ws.close();
    };
  }, []);

  // Functions for microphone control
  const getMicrophone = async () => {
    // Pull audio tracks from the same stream you used for video
    // This ensures you only open one getUserMedia call which includes audio.
    const videoElement = videoRef.current;
    if (!videoElement || !videoElement.srcObject) {
      throw new Error("No video/audio stream available");
    }

    const videoStream = videoElement.srcObject;
    // Extract audio tracks separately
    const audioStream = new MediaStream();
    videoStream.getAudioTracks().forEach((track) => {
      audioStream.addTrack(track);
    });

    // Create the MediaRecorder for audio data
    return new MediaRecorder(audioStream, { mimeType: "audio/webm" });
  };

  const openMicrophone = (mic, ws) => {
    return new Promise((resolve) => {
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
        if (event.data.size > 0 && ws && ws.readyState === WebSocket.OPEN) {
          // Send the audio blob over the WebSocket
          ws.send(event.data);
        }
      };

      // Start recording; “1000” ms means we’ll get `ondataavailable` every 1 second
      mic.start(1000);
    });
  };

  const closeMicrophone = async (mic) => {
    mic.stop();
  };

  // 3. Click handler to toggle microphone recording
  const handleRecordButtonClick = async () => {
    if (!socket) {
      console.error("WebSocket not ready. Cannot record.");
      return;
    }

    if (!microphone) {
      // Start recording
      try {
        const mic = await getMicrophone();
        await openMicrophone(mic, socket);
        setMicrophone(mic);
        setIsRecording(true);
      } catch (error) {
        console.error("error opening microphone:", error);
      }
    } else {
      // Stop recording
      try {
        await closeMicrophone(microphone);
      } catch (error) {
        console.error("error stopping microphone:", error);
      }
      setMicrophone(null);
      setIsRecording(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>Live Transcription</h1>

      {/* 1. Show the video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: "100%", maxWidth: "600px" }}
      />

      {/* 2. Button to toggle recording */}
      <div style={{ marginTop: "1rem" }}>
        <button id="record" onClick={handleRecordButtonClick}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {/* 3. Show the transcripts returned from server */}
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
