import next from "next";
import http from "http";
import { IncomingMessage, ServerResponse } from "http";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Define the HTTP server port
const HTTP_PORT = Number(process.env.HTTP_PORT) || 3000;

// Prepare the Next.js app and start the HTTP server
app
  .prepare()
  .then(() => {
    const server = http.createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        return handle(req, res);
      },
    );

    server.listen(HTTP_PORT, () => {
      console.log(`> HTTP server ready on http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error("Error starting the server:", err);
    process.exit(1);
  });
