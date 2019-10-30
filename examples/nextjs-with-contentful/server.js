const express = require("express");
const rendrApi = require("@ekino/rendr-api");
const next = require("next");
const services = require("./dist").default;

const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({
  dev: process.env.NODE_ENV !== "production",
  quiet: false
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // will return the api
  server.use("/api", rendrApi.createApi(services.loader));

  // call nextjs server
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
