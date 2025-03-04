import type { WebSocket } from "ws";
import { config } from "./config";
import type { ListenLiveClient } from "@deepgram/sdk";
import { LiveTranscriptionEvents } from "@deepgram/sdk";

/**
 * Sets up a Deepgram live transcription client that sends transcription
 * events over the provided WebSocket.
 */
export const setupDeepgram = async (
  ws: WebSocket
): Promise<ListenLiveClient> => {
  // Dynamically import the Deepgram SDK so that this code only runs on the server.
  const { createClient } = await import("@deepgram/sdk");
  const deepgramClient = createClient(config.deepgramApiKey);

  const deepgram = deepgramClient.listen.live({
    model: "nova-general",
    filler_words: true,
    language: "en-US",
    smart_format: true,
    punctuate: true,
  });

  // Set up all event listeners BEFORE connection happens
  deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
    console.log("deepgram: transcript received", data.channel?.alternatives?.[0]?.transcript || "");
    if (ws.readyState === 1) { // WebSocket.OPEN = 1
      ws.send(JSON.stringify(data));
    }
  });

  deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
    console.log("deepgram: metadata received");
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ metadata: data }));
    }
  });

  deepgram.addListener(LiveTranscriptionEvents.Open, () => {
    console.log("deepgram: connected");
  });

  deepgram.addListener(LiveTranscriptionEvents.Close, () => {
    console.log("deepgram: disconnected");
    clearInterval(keepAlive);
  });

  deepgram.addListener(LiveTranscriptionEvents.Error, (error) => {
    console.error("deepgram: error received", error);
    // Send error to client
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ error: error.message }));
    }
  });
  
  // Set up keepalive after all listeners are established
  const keepAlive = setInterval(() => {
    console.log("deepgram: keepalive");
    deepgram.keepAlive();
  }, 10 * 1000);

  // Handle client WebSocket closure
  ws.on("close", () => {
    console.log("Client WebSocket closed, cleaning up Deepgram connection");
    clearInterval(keepAlive);
    deepgram.send(JSON.stringify({ type: "CloseStream" }));
  });

  return deepgram;
};