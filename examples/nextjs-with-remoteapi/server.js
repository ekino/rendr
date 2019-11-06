const express = require("express");
const rendrApi = require("@ekino/rendr-api");

const api = require("./services/api");

const app = express();

app.use("/api", rendrApi.createApi(api.loader));

module.exports = app;
