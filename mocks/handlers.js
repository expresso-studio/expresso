// API request handlers
import { rest } from "msw";

export const handlers = [
  rest.get("/api/example", (req, res, ctx) => {
    return res(ctx.json({ message: "Hello from MSW" }));
  }),
];
