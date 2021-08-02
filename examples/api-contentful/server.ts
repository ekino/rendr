import { createApi } from "@ekino/rendr-api";
import { createMiddleware } from "@ekino/rendr-handler-http";

import express from "express";
import { RequestHandler } from "express-serve-static-core";
import cors from "cors";

import loader from "./helper/loader";

if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
  console.error(
    "Please set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN env variables"
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

app.use((req, res, next) => {
  const message = `[${new Date().toISOString()}] api-contentful - ${
    req.method
  } ${req.url}`;

  next();

  console.log(`${message} - ${res.statusCode}`);
});

// will return the api
app.use("/api", createMiddleware(createApi(loader)) as RequestHandler);
app.use("/", (req, res) => {
  res.redirect(301, "/api/");
});

// if the file is call directly, then the server is started,
// if the file is imported, the server is not started
if (require.main === module) {
  app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}

export default app;
