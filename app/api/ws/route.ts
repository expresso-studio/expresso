import { WebSocketServer } from 'ws';
import { setupDeepgram } from '../../../lib/deepgram';
import type { ListenLiveClient } from '@deepgram/sdk';

// Use a different port than the Next.js server to avoid conflicts
const WS_PORT = Number(process.env.WS_PORT) || 3001;

// Declare the WebSocket server with proper typing
let wsServer: WebSocketServer | null = null;

if (typeof window === 'undefined' && !wsServer) {
  try {
    wsServer = new WebSocketServer({ port: WS_PORT });
    console.log(`WebSocket server started on port ${WS_PORT}`);
  } catch (error) {
    console.error('Error starting WebSocket server:', error);
  }

  wsServer?.on('connection', (socket) => {
    console.log("ws: client connected");

    let deepgram: ListenLiveClient | null = setupDeepgram(socket);

    socket.on('message', (message: Buffer) => {
      console.log("ws: client data received");

      if (deepgram && deepgram.getReadyState() === 1) {
        console.log("ws: data sent to deepgram");
        // Convert Buffer to Uint8Array then to a new ArrayBuffer
        const uint8Array = new Uint8Array(message.buffer, message.byteOffset, message.byteLength);
        const arrayBuffer = uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
        deepgram.send(arrayBuffer);
      } else if (deepgram && deepgram.getReadyState() >= 2) {
        console.log("ws: retrying connection to deepgram");
        deepgram.finish();
        deepgram.removeAllListeners();
        deepgram = setupDeepgram(socket);
      }
    });

    socket.on('close', () => {
      console.log("ws: client disconnected");
      if (deepgram) {
        deepgram.finish();
        deepgram.removeAllListeners();
        deepgram = null;
      }
    });
  });
}

export async function GET(request: Request) {
  if (!wsServer) {
    return new Response(JSON.stringify({ message: 'WebSocket server is not running' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return new Response(JSON.stringify({ message: 'WebSocket server is running' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
