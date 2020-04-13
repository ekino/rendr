import { createApi } from "@ekino/rendr-api";
import express from "express";
import cors from "cors";
import { IncomingMessage, ServerResponse } from "http";

import loader from "./helper/loader";

if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
  console.error(
    "Please set CONTENTFUL_ACCESS_TOKEN and CONTENTFUL_ACCESS_TOKEN env variables"
  );

  process.exit(1);
}

// configure server
const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();

app.use(
  cors({
    exposedHeaders: "X-Rendr-Content-Type",
  })
);

app.use((req: IncomingMessage, res: ServerResponse, next) => {
  const message = `[${new Date().toISOString()}] api-contentful - ${
    req.method
  } ${req.url}`;

  next();

  console.log(`${message} - ${res.statusCode}`);
});

// will return the api
app.use("/api", createApi(loader));
app.use("/", (req, res) => {
  res.redirect(301, "/api/");
});

// if the file is call directly, then the server is started,
// if the file is imported, the server is not started
if (require.main === module) {
  app.listen(port, (err: Error) => {
    if (err) {
      throw err;
    }

    console.log(`> Ready on http://localhost:${port}`);
  });
}

export default app;
