// lib/websocketServer.ts
import { WebSocketServer } from 'ws';
import { setupDeepgram } from './setup-deepgram';

const WS_PORT = Number(process.env.WS_PORT) || 3001;

export const startWebSocketServer = () => {
  const wsServer = new WebSocketServer({ port: WS_PORT });
  console.log(`WebSocket server started on port ${WS_PORT}`);

  wsServer.on('connection', (socket) => {
    console.log('ws: client connected');
    let deepgram: any | null = null;

    // Set up Deepgram for this connection.
    setupDeepgram(socket)
      .then((client) => {
        deepgram = client;
      })
      .catch((error) => {
        console.error('Error setting up Deepgram:', error);
      });

    socket.on('message', (message: Buffer) => {
      console.log('ws: client data received');
      if (deepgram && deepgram.getReadyState() === 1) {
        console.log('ws: sending data to Deepgram');
        const uint8Array = new Uint8Array(message.buffer, message.byteOffset, message.byteLength);
        const arrayBuffer = uint8Array.buffer.slice(
          uint8Array.byteOffset,
          uint8Array.byteOffset + uint8Array.byteLength
        );
        deepgram.send(arrayBuffer);
      } else if (deepgram && deepgram.getReadyState() >= 2) {
        console.log('ws: reconnecting Deepgram');
        deepgram.send(JSON.stringify({ type: 'CloseStream' }));
        deepgram = null;
        setupDeepgram(socket)
          .then((client) => {
            deepgram = client;
          })
          .catch((error) => {
            console.error('Error reinitializing Deepgram:', error);
          });
      }
    });

    socket.on('close', () => {
      console.log('ws: client disconnected');
      if (deepgram) {
        deepgram.send(JSON.stringify({ type: 'CloseStream' }));
        deepgram = null;
      }
    });
  });

  return wsServer;
};