import {
  createContext as coreCreateContext,
  Map,
  RendrCtx,
  RendrRequest,
  PageType,
  ResponsePage,
  RedirectPage,
  Page,
  Body,
  pipe,
} from "@ekino/rendr-core";
import { parse } from "query-string";
import { Readable, Writable } from "stream";

export function createContext(event: any, _context: any): RendrCtx {
  if (typeof event === "string") {
    return coreCreateContext(event);
  }

  const isServerSide = true;

  const headers: Map = {};
  // normalize the headers value
  for (let field in event.headers) {
    if (typeof event.headers[field] === "string") {
      headers[field.toLocaleLowerCase()] = event.headers[field] as string;
    }
  }

  let body: Body;
  if (event.httpMethod == "POST") {
    body = event.body ?? headers["body"];

    if (event.isBase64Encoded) {
      body = Buffer.from(
        event.body ?? headers["body"],
        "base64"
      ).toString() as string;
    }

    if ("content-type" in headers) {
      if (headers["content-type"] === "application/x-www-form-urlencoded") {
        body = parse(body);
      }

      if (headers["content-type"].substr(-4) === "json") {
        try {
          body = JSON.parse(body);
        } catch (err) {
          // unable to parse the body
          console.error(event);
        }
      }
    }
  }

  let pathname = "/";

  if (event.path && event.path.length > 0) {
    pathname = event.path;
  }

  // specific rendr stuff
  if (event.pathParameters && "rendr_path" in event.pathParameters) {
    pathname = `/${event.pathParameters["rendr_path"]}`;
  }

  const request: RendrRequest = {
    hostname: headers["host"],
    pathname,
    query: event.queryStringParameters ?? {},
    params: event.pathParameters ?? {},
    headers,
    body,
    method: event.httpMethod,
  };

  return {
    isServerSide,
    isClientSide: !isServerSide,
    settings: {},
    req: request,
  };
}

export async function send(page: PageType) {
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
      ] = `public, max-age=${page.cache.ttl}, s-maxage=${page.cache.sharedTtl}`;
    }

    body = JSON.stringify(page);
  }

  if (page instanceof ResponsePage) {
    headers = {
      ...headers,
      ...page.headers,
    };

    if (page.body instanceof Readable) {
      const writable = new Writable({
        write: (chunk, encoding, cb) => {
          body += chunk;

          if (cb) {
            cb();
          }
        },
      });

      await pipe(page.body, writable);
    } else {
      body = page.body;
    }
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

  return {
    statusCode: page.statusCode,
    headers,
    body,
  };
}

export type WrapperOptions = {
  createContext?: Function;
};

export function wrapper(fn: Function, options: WrapperOptions) {
  return async (event: any, context: any) => {
    const createCtx = options.createContext
      ? options.createContext
      : createContext;

    const ctx = createCtx(event, context);

    const page = await fn(ctx);
  
    return await send(page);
  };
}
