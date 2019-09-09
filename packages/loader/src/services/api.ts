import { RequestCtx, createPage, Page } from "@ekino/rendr-core";
import { Readable, Writable } from "stream";
import Axios, { ResponseType } from "axios";

import { Loader } from "../types";

const headersToTransfers = [
  "Last-Modified",
  "Content-Type",
  "Content-Range",
  "Content-Length",
  "Accept-Ranges",
  "Date"
];

// The loader is used to load the Page definition from an API
// This code can be called from the nodejs or the browser.
// However the pipe for raw binary are not likely to be run by the browser
// as the server will stream the content, and so cannot be run by the browser.
export function createApiLoader(baseUrl: string): Loader {
  return async (ctx: RequestCtx) => {
    const url = `${baseUrl}${ctx.asPath}`;

    const headers: any = {
      "X-User-Agent": "ekino/rendr"
    };

    let responseType: ResponseType = "json";

    if (ctx.isServerSide) {
      if ("range" in ctx.req.headers) {
        headers["range"] = ctx.req.headers["range"];
      }

      headers["accept"] = ctx.req.headers["accept"];
      // please note: axios does not support br (brotli)
      headers["accept-encoding"] = "gzip, deflate";

      responseType = "stream";
    }

    const response = await Axios.get(url, {
      responseType,
      headers
    });

    if (!("x-rendr-content-type" in response.headers)) {
      // @todo: check how we can add a logger here
      return;
    }

    // We are on the client side, so no need to pipe data to the client.
    // => already done by the server
    if (ctx.isClientSide) {
      return createPage(response.data);
    }

    // we need to pipe data to the client as we are running this code from the server
    if (ctx.isServerSide) {
      if (response.headers["x-rendr-content-type"] === "rendr/document") {
        return pipePageToClient(response.data);
      }

      if (response.headers["x-rendr-content-type"] !== "rendr/document") {
        ctx.res.statusCode = response.status;

        headersToTransfers.forEach(n => {
          if (n.toLowerCase() in response.headers) {
            ctx.res.setHeader(n, response.headers[n.toLowerCase()]);
          }
        });

        return pipe(
          response.data,
          ctx.res
        );
      }
    }
  };
}

/**
 * This function pipe a Readable Stream into a Writable stream in order to pass
 * the response to the server from to the client. This is usefull to act as a proxy
 * and avoid to buffer all the response body in the current process.
 *
 * @param source
 * @param dest
 */
function pipe(source: Readable, dest: Writable): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    source.pipe(dest);

    source.on("end", (err: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * This function pipe a Readable Stream into an internal buffer so it is possible
 * to reuse the buffer to create a Page object.
 *
 * @param source
 */
function pipePageToClient(source: Readable): Promise<Page> {
  let data = "";
  const dest = new Writable({
    write(chunk, _, callback) {
      data += chunk;

      callback();
    }
  });

  return pipe(
    source,
    dest
  ).then(() => {
    return createPage(JSON.parse(data));
  });
}
