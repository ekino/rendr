const express = require("express");
const rendrApi = require("@ekino/rendr-api");
const services = require("./services/api");

const app = express();

app.use("/api", rendrApi.createApi(services.loader));

module.exports = app;
