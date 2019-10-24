const express = require("express");
const rendrApi = require("@ekino/rendr-api");
const rendrSitemap = require("@ekino/rendr-sitemap");

const api = require("./services/api");
const sitemap = require("./services/sitemap");

const app = express();

app.use("/api", rendrApi.createApi(api.loader));
app.use(
  "/sitemap.xml",
  rendrSitemap.createSitemapRequestHandler(sitemap.generator)
);

module.exports = app;
