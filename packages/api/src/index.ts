import Express from "express";

import { Loader } from "@ekino/rendr-loader";
import { createContext } from "@ekino/rendr-core";

// should return a middleware api to return page definition through http
export function createApi(loader: Loader): Express.RequestHandler {
  return async (req, res, next) => {
    const ctx = createContext(req, res);

    res.set("X-Rendr-Content-Type", "rendr/octet-stream");

    // a loader can also take over the on the response without
    // returning any page object: ie: streaming data to the client
    const page = await loader(ctx);

    if (!page) {
      return;
    }

    res.set("X-Rendr-Content-Type", "rendr/document");

    res.json(page);
  };
}
