import {
  createPage,
  ClientSideError,
  ResponsePage,
  createResponsePage,
  Map,
  pipePageToClient,
} from "@ekino/rendr-core";
import Axios, { ResponseType, AxiosRequestConfig } from "axios";

import { Loader, AxiosOptionsBuilder } from "../types";

const headersToTransfers = [
  "Last-Modified",
  "Content-Type",
  "Content-Range",
  "Content-Length",
  "Accept-Ranges",
  "Date",
  "Cache-Control",
  "Expires",
  "Etag",
];

function defaultOptionsBuilder(url: string, options: AxiosRequestConfig) {
  return { url, options };
}

// The loader is used to load the Page definition from an API
// This code can be called from the nodejs or the browser.
// However the pipe for raw binary are not likely to be run by the browser
// as the server will stream the content, and so cannot be run by the browser.
export function createApiLoader(
  baseUrl: string,
  optionsBuilder: AxiosOptionsBuilder = defaultOptionsBuilder
): Loader {
  return async (ctx, page, next) => {
    const headers: any = {
      "X-User-Agent": "ekino/rendr",
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

    const { url, options } = optionsBuilder(`${baseUrl}${ctx.req.pathname}`, {
      responseType,
      headers,
      params: ctx.req.query,
    });

    const response = await Axios.get(url, options);

    if (!("x-rendr-content-type" in response.headers)) {
      // @todo: check how we can add a logger here
      return next(page);
    }

    // We are on the client side, so no need to pipe data to the client.
    // => already done by the server
    if (ctx.isClientSide) {
      if (
        response.headers["x-rendr-content-type"] === "rendr/document" &&
        response.headers["content-type"] &&
        response.headers["content-type"].substr(0, 16) === "application/json"
      ) {
        return next(createPage(response.data));
      }

      throw new ClientSideError(
        "Invalid x-rendr-content-type or content-type header value."
      );
    }

    // we need to pipe data to the client as we are running this code from the server
    if (ctx.isServerSide) {
      if (response.headers["x-rendr-content-type"] === "rendr/document") {
        return await pipePageToClient(response.data);
      }

      if (response.headers["x-rendr-content-type"] !== "rendr/document") {
        const headers: Map = {};

        headersToTransfers.forEach((n) => {
          if (n.toLowerCase() in response.headers) {
            headers[n] = response.headers[n.toLowerCase()];
          }
        });

        return createResponsePage(headers, response.data, response.status);
      }
    }
  };
}
