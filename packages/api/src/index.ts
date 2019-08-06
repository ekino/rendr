import { Loader } from "@ekino/rendr-loader";

import Express from "express";

// should return a middleware api to return page definition through http
export function createApi(loader: Loader): Express.RequestHandler {
  return async (req, res, next) => {
    const ctx = {
      req,
      res,
      pathname: "",
      params: {},
      query: "",
      asPath: req.url
    };

    res.set("X-Rendr-Content-Type", "rendr/octet-stream");

    const page = await loader(ctx);

    if (!page) {
      return;
    }

    res.set("X-Rendr-Content-Type", "rendr/document");

    res.json(page);
  };
}
