import { Page, Cache, Head, BlockDefinition, RequestCtx } from "./types";
import { IncomingMessage, ServerResponse } from "http";
import parse from "url-parse";

export * from "./types";

export function isObject(data: any): boolean {
  return data !== null && typeof data === "object";
}

export function isArray(data: any): boolean {
  return Array.isArray(data);
}

export function normalizeCache(data: any): Cache {
  const cache: Cache = {
    ttl: 0
  };

  if (!isObject(data)) {
    return cache;
  }

  cache.ttl = "ttl" in data ? parseInt(data.ttl, 0) : 0;

  return cache;
}

export function normalizeHead(data: any): Head {
  const head: Head = {
    titleTemplate: "%s",
    defaultTitle: "-",
    title: "-",
    link: "",
    htmlAttributes: {},
    meta: []
  };

  if (!isObject(data)) {
    return head;
  }

  if ("titleTemplate" in data) {
    head.titleTemplate = data.titleTemplate;
  }

  if ("defaultTitle" in data) {
    head.defaultTitle = data.defaultTitle;
  }

  if ("title" in data) {
    head.title = data.title;
  }

  if ("link" in data) {
    head.link = data.link;
  }

  if ("htmlAttributes" in data) {
    head.htmlAttributes = data.htmlAttributes;
  }

  if ("meta" in data) {
    head.meta = data.meta;
  }

  return head;
}

export function normalizeBlockDefinitions(data: any[]): BlockDefinition[] {
  const blocks: BlockDefinition[] = [];

  if (!isArray(data)) {
    return blocks;
  }

  data.map(b => {
    const block = normalizeBlockDefinition(b);

    if (!block) {
      return;
    }

    blocks.push(block);
  });

  return blocks;
}

export function normalizeBlockDefinition(data: any): BlockDefinition | void {
  if (!isObject(data)) {
    return;
  }

  if (!("type" in data)) {
    return;
  }

  return {
    container: "container" in data ? data.container : "body",
    order: "order" in data ? data.order : 0,
    settings:
      "settings" in data && isObject(data.settings) ? data.settings : {},
    type: data.type
  };
}

export function createPage(data: any): Page {
  const page = new Page();

  page.statusCode = "statusCode" in data ? data.statusCode : 200;
  page.type = "type" in data ? data.type : "document";
  page.template = "template" in data ? data.template : "default";
  page.id = "id" in data ? data.template : "id";
  page.cache = normalizeCache(data.cache);
  page.head = normalizeHead(data.head);
  page.blocks = normalizeBlockDefinitions(data.blocks);
  page.settings = "settings" in data ? data.settings : [];

  return page;
}

/**
 * This code can be called from nodejs or the browser, so the context source will be different
 * @param req 
 * @param res 
 */
export function createContext(
  req: IncomingMessage | {url: string},
  res: ServerResponse
): RequestCtx {

  const isServerSide = res ? true : false;
  const asPath = req.url;
  const url = parse(asPath, true);

  const ctx: RequestCtx = {
    pathname: url.pathname,
    query: url.query,
    // params is empty because for now there are no
    // routing to analyse the pathname, this will be done later on
    // in the query process
    params: {}, 
    asPath: asPath,
    isServerSide: isServerSide,
    isClientSide: !isServerSide,
    // @ts-ignore
    req: isServerSide ? req : null,
    // @ts-ignore
    res: isServerSide ? res : null
  };

  return ctx;
}
