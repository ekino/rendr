const express = require("express");
const cors = require("cors");
const rendrApi = require("@ekino/rendr-api");

const port = parseInt(process.env.PORT, 10) || 3000;
const api = require("./services/api");

const app = express();

app.use((req, res, next) => {
  const message = `[${new Date().toISOString()}}] api-static - ${req.method} ${
    req.url
  }`;
  console.log(message);

  next();

  console.log(`${message} - ${res.statusCode}`);
});

app.use(cors());
app.use("/api", rendrApi.createApi(api.loader));

// if the file is call directly, then the server is started,
// if the file is imported, the server is not started
if (require.main === module) {
  app.listen(port, err => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
}

module.exports = app;
