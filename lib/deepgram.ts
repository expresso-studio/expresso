import { createClient, LiveTranscriptionEvents, ListenLiveClient } from '@deepgram/sdk';
import type { WebSocket } from 'ws';
import { config } from './config';

const deepgramClient = createClient(config.deepgramApiKey);

export const setupDeepgram = (ws: WebSocket): ListenLiveClient => {
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
    deepgram.finish();
  });

  deepgram.addListener(LiveTranscriptionEvents.Error, (error) => {
    console.error("deepgram: error received", error);
  });

  return deepgram;
};


