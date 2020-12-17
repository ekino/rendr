import parse from "url-parse";

import {
  Page,
  Cache,
  Head,
  BlockDefinition,
  RendrCtx,
  RendrRequest,
  RedirectPage,
  ResponsePage,
  Map,
  Body,
} from "./types";

export * from "./types";
export * from "./errors";
export * from "./generator";
export * from "./stream";

export function isObject(data: any): boolean {
  return data !== null && typeof data === "object";
}

export function isArray(data: any): boolean {
  return Array.isArray(data);
}

export function normalizeCache(data: any): Cache {
  const cache: Cache = {
    ttl: 0,
    sharedTtl: 0,
  };

  if (!isObject(data)) {
    return cache;
  }

  cache.ttl = "ttl" in data ? parseInt(data.ttl, 10) : 0;
  cache.sharedTtl = "sharedTtl" in data ? parseInt(data.sharedTtl, 10) : 0;

  return cache;
}

export function normalizeHead(data: any): Head {
  const head: Head = {
    titleTemplate: "%s",
    defaultTitle: "-",
    title: "-",
    links: [],
    htmlAttributes: {},
    meta: [],
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

  if ("links" in data) {
    head.links = data.links;
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

  data.map((b) => {
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
    id: "id" in data ? data.id : "",
    meta: "meta" in data ? data.meta : {},
    container: "container" in data ? data.container : "body",
    order: "order" in data ? data.order : 0,
    settings:
      "settings" in data && isObject(data.settings) ? data.settings : {},
    type: data.type,
  };
}

export function createPage(data: any = {}): Page {
  const page = new Page();

  page.statusCode = "statusCode" in data ? data.statusCode : 200;
  page.type = "type" in data ? data.type : "document";
  page.template = "template" in data ? data.template : "default";
  page.id = "id" in data ? data.id : "id";
  page.cache = normalizeCache(data.cache);
  page.head = normalizeHead(data.head);
  page.blocks = normalizeBlockDefinitions(data.blocks);
  page.settings =
    "settings" in data && isObject(data.settings) ? data.settings : {};
  page.path = "path" in data ? data.path : "";

  return page;
}

/**
 * This code can be called from nodejs or the browser, so the context source will be different
 * @param req
 * @param res
 */
export function createContext(url: string): RendrCtx {
  // jest defines a set of global variable, for now, this
  // is the only reliable option found.
  let isServerSide = !(window instanceof Window);

  const urlInfo = parse(url, true);

  const request: RendrRequest = {
    hostname: urlInfo.hostname,
    pathname: urlInfo.pathname,
    query: urlInfo.query,
    // params is empty because for now there are no
    // routing to analyse the pathname, this will be done later on
    // in the query process
    params: {},
    headers: {},
    body: "",
    method: "GET",
  };

  return {
    isServerSide,
    isClientSide: !isServerSide,
    settings: {},
    req: request,
  };
}

export function createRedirectPage(statusCode: number, location: string) {
  const redirect = new RedirectPage();
  redirect.location = location;
  redirect.statusCode = statusCode;

  return redirect;
}

export function createResponsePage(
  statusCode: number,
  headers: Map,
  body: Body
) {
  const response = new ResponsePage();
  response.headers = headers;
  response.body = body;
  response.statusCode = statusCode;

  return response;
}

// last page get the priority
export function mergePages(pages: Page[]): Page {
  const page = new Page();

  pages
    .filter((p) => p) // make sure page is defined
    .forEach((p) => {
      page.cache.ttl = p.cache.ttl;
      page.cache.sharedTtl = p.cache.sharedTtl;
      page.head = {
        titleTemplate:
          p.head.titleTemplate.length > 0
            ? p.head.titleTemplate
            : page.head.titleTemplate,
        defaultTitle:
          p.head.defaultTitle.length > 0
            ? p.head.defaultTitle
            : page.head.defaultTitle,
        title: p.head.title.length > 0 ? p.head.title : page.head.title,
        links: [...page.head.links, ...p.head.links],
        htmlAttributes:
          Object.keys(p.head.htmlAttributes).length > 0
            ? p.head.htmlAttributes
            : page.head.htmlAttributes,
        // for meta, we append from parent
        meta: [...page.head.meta, ...p.head.meta],
      };
      page.path = p.path;
      page.template = p.template.length > 0 ? p.template : page.template;
      page.type = p.type.length > 0 ? p.type : page.type;
      page.id = p.id; // we always need to return the last id
      page.statusCode = p.statusCode;
      page.settings = { ...page.settings, ...p.settings };
      page.blocks = [...page.blocks, ...p.blocks];
    });

  return page;
}
