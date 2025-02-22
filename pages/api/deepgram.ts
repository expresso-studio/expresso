import { startWebSocketServer } from '../../lib/start-deepgram-websocket';
import { NextApiRequest, NextApiResponse } from 'next';

// Start the WebSocket server when this file is imported.
const wsServer = startWebSocketServer();

// Export a default function to handle API requests.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!wsServer) {
    return res.status(500).json({ message: 'WebSocket server is not running' });
  }

  return res.status(200).json({ message: 'WebSocket server is running' });
}