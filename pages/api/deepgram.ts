// pages/api/ws.ts
import { WebSocketServer } from 'ws';
import { setupDeepgram } from '../../lib/deepgram';
import type { ListenLiveClient } from '@deepgram/sdk';

// Set the port for the WebSocket server.
// Make sure this port does not conflict with Next.js (which runs on 3000).
const WS_PORT = Number(process.env.WS_PORT) || 3001;

// This variable holds the WebSocket server instance.
let wsServer: WebSocketServer | null = null;

if (typeof window === 'undefined' && !wsServer) {
  try {
    wsServer = new WebSocketServer({ port: WS_PORT });
    console.log(`WebSocket server started on port ${WS_PORT}`);
  } catch (error) {
    console.error('Error starting WebSocket server:', error);
  }
  
  wsServer.on('connection', (socket) => {
    console.log("ws: client connected");

    let deepgram: ListenLiveClient | null = null;
    // Set up Deepgram for this connection.
    setupDeepgram(socket)
      .then((client) => {
        deepgram = client;
      })
      .catch((error) => {
        console.error("Error setting up Deepgram:", error);
      });

    socket.on('message', (message: Buffer) => {
      console.log("ws: client data received");

      if (deepgram && deepgram.getReadyState() === 1) {
        console.log("ws: sending data to Deepgram");
        // Convert the Buffer to an ArrayBuffer.
        const uint8Array = new Uint8Array(message.buffer, message.byteOffset, message.byteLength);
        const arrayBuffer = uint8Array.buffer.slice(
          uint8Array.byteOffset,
          uint8Array.byteOffset + uint8Array.byteLength
        );
        deepgram.send(arrayBuffer);
      } else if (deepgram && deepgram.getReadyState() >= 2) {
        console.log("ws: reconnecting Deepgram");
        deepgram.send(JSON.stringify({ type: 'CloseStream' }));
        deepgram = null;
        setupDeepgram(socket)
          .then((client) => {
            deepgram = client;
          })
          .catch((error) => {
            console.error("Error reinitializing Deepgram:", error);
          });
      }
    });

    socket.on('close', () => {
      console.log("ws: client disconnected");
      deepgram.send(JSON.stringify({ type: 'CloseStream' }));
      deepgram = null;
    });
  });
}

// We expose a simple GET endpoint to check if the WebSocket server is running.
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


