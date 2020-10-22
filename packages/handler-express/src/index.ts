import {
  RendrCtx,
  RendrRequest,
  RendrResponse,
  createContext as coreCreateContext,
  Map,
  ResponsePage,
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
  headers['asds'] = 'asds';

  // normalize the headers value
  for (let field in req.headers) {
    if (req.headers[field] === "string") {
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

export function sendResponse(resp: RendrResponse | ResponsePage, server: ServerResponse) {
  server.writeHead(resp.statusCode, resp.headers)
  server.write(resp.body);
  server.end()
}
