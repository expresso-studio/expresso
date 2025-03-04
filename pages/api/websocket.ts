import { NextApiRequest, NextApiResponse } from "next";
import { setupDeepgram } from "../../lib/setup-deepgram";
import type { Duplex } from "stream";
import { ListenLiveClient } from "@deepgram/sdk";


interface CustomSocket extends Duplex {
  server?: {
    wss?: any;
    on: (event: string, listener: (...args: any[]) => void) => void;
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as CustomSocket;

  if (!socket || !socket.server) {
    res.status(500).json({ error: "Socket server not available" });
    return;
  }

  if (!socket.server.wss) {
    console.log("Starting WebSocket server...");

    // Dynamically import ws (CommonJS compatible)
    const WebSocket = require("ws");
    const wss = new WebSocket.Server({ noServer: true });

    socket.server.on("upgrade", (request, rawSocket, head) => {
      if (!rawSocket) return;
      wss.handleUpgrade(request, rawSocket as any, head, (ws:any) => {
        wss.emit("connection", ws, request);
      });
    });

    wss.on("connection", async (ws:any) => {
      console.log("Client connected to WebSocket");

      let deepgram: ListenLiveClient | null = null;

      try {
        // Add error handler for client WebSocket
        ws.on("error", (error:Error) => {
          console.error("WebSocket client error:", error);
        });
        
        deepgram = await setupDeepgram(ws);
        
        // Handle audio data from client
        ws.on("message", (message:any) => {
          console.log(`Received client message: ${typeof message}, size: ${
            Buffer.isBuffer(message) ? message.length : 
            (message instanceof ArrayBuffer ? message.byteLength : 'unknown')
          } bytes`);
          
          if (deepgram) {
            try {
              deepgram.send(message);
            } catch (error) {
              console.error("Error sending data to Deepgram:", error);
            }
          }
        });
        
      } catch (error) {
        console.error("Error setting up Deepgram:", error);
        ws.close();
        return;
      }

      ws.on("close", () => {
        console.log("Client disconnected");
        if (deepgram) {
          try {
            deepgram.finish();
          } catch (error) {
            console.error("Error closing Deepgram connection:", error);
          }
        }
      });
    });

    socket.server.wss = wss;
  }

  res.end();
}