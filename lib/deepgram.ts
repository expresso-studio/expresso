// src/lib/deepgram.ts
'use server';

import type { WebSocket } from 'ws';
import { config } from './config';
import type { ListenLiveClient} from '@deepgram/sdk';
const { LiveTranscriptionEvents } = require("@deepgram/sdk");

/**
 * Sets up a Deepgram live transcription client that sends transcription
 * events over the provided WebSocket.
 */
export const setupDeepgram = async (ws: WebSocket): Promise<ListenLiveClient> => {
  // Dynamically import the Deepgram SDK so that this code only runs on the server.
  const { createClient } = await import('@deepgram/sdk');
  const deepgramClient = createClient(config.deepgramApiKey);
  
  const deepgram = deepgramClient.listen.live({
    model: "nova-3-general",
    filler_words: true,
    language: "en-US",
  });

  const keepAlive = setInterval(() => {
    console.log("deepgram: keepalive");
    deepgram.keepAlive();
  }, 10 * 1000);

  deepgram.addListener(LiveTranscriptionEvents.Open, () => {
    console.log("deepgram: connected");

    deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
      console.log("deepgram: transcript received");
      ws.send(JSON.stringify(data));
    });

    deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
      console.log("deepgram: metadata received");
      ws.send(JSON.stringify({ metadata: data }));
    });
  });

  deepgram.addListener(LiveTranscriptionEvents.Close, () => {
    console.log("deepgram: disconnected");
    clearInterval(keepAlive);
    deepgram.send(JSON.stringify({ type: 'CloseStream' }));

    
  });

  deepgram.addListener(LiveTranscriptionEvents.Error, (error) => {
    console.error("deepgram: error received", error);
  });

  return deepgram;
};
