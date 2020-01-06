import Express from "express";

import { Loader } from "@ekino/rendr-loader";
import { createContext, Page } from "@ekino/rendr-core";
import { IncomingMessage } from "http";

// should return a middleware api to return page definition through http
export function createApi(loader: Loader): Express.RequestHandler {
  return async (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) => {
    const ctx = createContext(req as IncomingMessage, res);

    res.set("X-Rendr-Content-Type", "rendr/octet-stream");

    // a loader can also take over the on the response without
    // returning any page object: ie: streaming data to the client
    const page = await loader(ctx, new Page(), () => null);

    if (!page) {
      return;
    }

    // the loader already send content, nothing for use
    if (res.headersSent) {
      return;
    }

    res.set("X-Rendr-Content-Type", "rendr/document");

    res.json(page);
  };
}
