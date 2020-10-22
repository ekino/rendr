import Express from "express";
import {
  RendrCtx,
  RendrRequest,
  RendrResponse,
  createContext as coreCreateContext,
} from "@ekino/rendr-core";
import parse from "url-parse";

/**
 * This code can be called from nodejs or the browser, so the context source will be different
 * @param req
 * @param res
 */
export function createContext(req: Express.Request | string): RendrCtx {
  if (typeof req === "string") {
    return coreCreateContext(req);
  }

  const isServerSide = true;
  const headers = {};

  // normalize the headers value
  for (let field in req.headers) {
    headers[field.toLocaleLowerCase()] = req.headers[field];
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

export function sendResponse(resp: RendrResponse, server: Express.Response) {
  for (let field in resp.headers) {
    server.set(field, resp.headers[field]);
  }

  server.status(resp.statusCode).send(resp.body);
}
