import {
  createInMemoryLoader,
  createChainedLoader,
  errorBoundaryLoader
} from "@ekino/rendr-loader";

import { createApi } from "@ekino/rendr-api";

import express from "express";
import cors from "cors";

import * as Pages from "./pages";
import { IncomingMessage, ServerResponse } from "http";

if (!process.env.CONTENTFUL_SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN) {
  console.error(
    "Please set CONTENTFUL_ACCESS_TOKEN and CONTENTFUL_ACCESS_TOKEN env variables"
  );

  process.exit(1);
}

// define routes
const routes = {
  "/sitemap.xml": Pages.sitemap,
  "/articles": Pages.articleList,
  "/articles/:slug": Pages.article,
  "/*": Pages.catchAll
};

// configure page loaders
const loader = createChainedLoader([
  errorBoundaryLoader,
  createInMemoryLoader(routes)
]);

// configure server
const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();

app.use(cors());

app.use((req: IncomingMessage, res: ServerResponse, next) => {
  const message = `[${new Date().toISOString()}}] api-contentful - ${
    req.method
  } ${req.url}`;
  console.log(message);

  next();

  console.log(`${message} - ${res.statusCode}`);
});

// will return the api
app.use("/api", createApi(loader));
app.use("/", (req, res) => {
  res.redirect("/api/", 301);
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
