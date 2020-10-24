import {
  RendrCtx,
  RendrRequest,
  createContext as coreCreateContext,
  Map,
  ResponsePage,
  Page,
  RedirectPage,
  PageType,
  pipe,
  Body,
} from "@ekino/rendr-core";
import parse from "url-parse";
import { IncomingMessage, ServerResponse } from "http";

/**
 * This code can be called from nodejs or the browser, so the context source will be different
 * @param req
 * @param res
 */
export function createContext(req: IncomingMessage | string): RendrCtx {
  if (typeof req === "string") {
    return coreCreateContext(req);
  }

  const isServerSide = true;
  const headers: Map = {};

  // normalize the headers value
  for (let field in req.headers) {
    if (typeof req.headers[field] === "string") {
      headers[field.toLocaleLowerCase()] = req.headers[field] as string;
    }
  }

  let url = `https://${headers["host"]}${req.url}`;

  const urlInfo = parse(url, true);

  const request: RendrRequest = {
    hostname: urlInfo.hostname,
    pathname: urlInfo.pathname,
    method: req.method,
    query: urlInfo.query,
    // params is empty because for now there are no
    // routing to analyse the pathname, this will be done later on
    // in the query process
    params: {},
    headers,
    body: req,
  };

  return {
    isServerSide,
    isClientSide: !isServerSide,
    settings: {},
    req: request,
  };
}

export function createMiddleware(fn: Function) {
  return async (req: IncomingMessage, res: ServerResponse, next: Function) => {
    const ctx = createContext(req);

    const page = await fn(ctx);

    await send(res, page);
  };
}

export async function send(res: ServerResponse, page: PageType) {
  let headers = {
    "X-Rendr-Content-Type": "rendr/octet-stream",
    "Content-Type": "application/octet-stream",
    "Cache-Control": "private, max-age=0, no-cache",
  };

  let body: Body = "";

  if (page instanceof Page) {
    headers["Content-Type"] = "application/json";
    headers["X-Rendr-Content-Type"] = "rendr/document";

    if (page.cache.ttl > 0 && page.statusCode == 200) {
      headers[
        "Cache-Control"
      ] = `public, max-age=${page.cache.ttl}, s-maxage=${page.cache.ttl}`;
    }

    body = JSON.stringify(page);
  }

  if (page instanceof ResponsePage) {
    headers = {
      ...headers,
      ...page.headers,
    };

    body = page.body;
  }

  if (page instanceof RedirectPage) {
    headers = {
      ...headers,
      ...{
        Location: page.location,
        "X-Rendr-Content-Type": "rendr/redirect",
      },
    };
  }

  res.writeHead(page.statusCode, headers);

  await pipe(body, res);

  res.end();
}
