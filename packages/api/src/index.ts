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

    // a loader can also take over the response without
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

    if (page.cache.ttl > 0 && page.statusCode == 200) {
      res.set(
        "Cache-Control",
        `public, max-age=${page.cache.ttl}, s-maxage=${page.cache.ttl}`
      );
    } else {
      res.set("Cache-Control", "private, max-age=0, no-cache");
    }

    res.json(page);
  };
}
