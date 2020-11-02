# UPGRADE

## v1.0.0

### Context update

This version comes with a major refactoring on the context object. The `RequestCtx` object is now gone and has been replaced by a `RendrCtx` object.

```ts
export interface RequestCtx {
  hostname: string; // the hostname requested
  pathname: string; // the path - without the query string
  query: Map; // the query string, parsed
  params: Map; // the params from the routing, ie param from nice url
  asPath: string; // the complete path - pathname + query
  isServerSide: boolean;
  isClientSide: boolean;
  req: IncomingMessage;
  res?: ServerResponse;
  // anything that need to be set during the life time of the request,
  // this data will no be exposed on the end user.
  settings: Settings;
}
```

The request information is now part of a standardized object `RendrRequest`. There is no more reference to any underlying reference to nodejs runtime (like `IncomingMessage` or `ServerResponse`). This make the refactoring more compatible with serverless provider.

```ts
export interface RendrCtx {
  isServerSide: boolean;
  isClientSide: boolean;
  settings: Settings;
  req: RendrRequest;
}

export interface RendrRequest {
  hostname: string; // the hostname requested
  headers: Map;
  query: Map; // the query string, parsed
  pathname: string; // the path - without the query string
  params: Map; // the params from the routing, ie param from nice url
  body: Body;
  method: string;
}
```

The new Request/Response model helps to integrate `rendr` with any javascript framework if a valid handler is available. 

The main change is about updating method signatures:

```diff
-import { RequestCtx, BlockDefinition, Page } from "@ekino/rendr-core";
+import { RendrCtx, BlockDefinition, Page } from "@ekino/rendr-core";

// ...

export type Handler = (
  definition: BlockDefinition,
-  ctx: RequestCtx,
+  ctx: RendrCtx,
  page: Page
) => Promise<BlockDefinition>;

```

For instance, for ExpressJS (based on NodeJS `IncomingMessage`/`ServerResponse`), it is now required to import the `createMiddleware` function to transform the `IncomingMessage` into a `RendrCtx` and `ServerResponse` into a valid `Express` response.

```diff
import { createApi } from "@ekino/rendr-api";
+import { createMiddleware } from "@ekino/rendr-handler-http";

import express from "express";
import cors from "cors";
import { IncomingMessage, ServerResponse } from "http";

-app.use("/api", createApi(loader));
+app.use("/api", createMiddleware(createApi(loader)));
app.use("/", (req, res) => {
  res.redirect(301, "/api/");
});

```

The update also required to change how request information is used:

```diff
    try {
-      site = normalizer(ctx, await GetWebsite(client, ctx.hostname));
+      site = normalizer(ctx, await GetWebsite(client, ctx.req.hostname));
    } catch (err) {
      throw new InternalServerError(
-        `[Contentful] Unable to load the website - domain: ${ctx.hostname}`,
+        `[Contentful] Unable to load the website - domain: ${ctx.req.hostname}`,
        err
      );
    }
```


### Block definition

The block definition must now have :

 - a `id` field: you can used that id if you need to link the block edition to a CMS for intance.
 - a `meta` field: you can use that field to store any information you like, this information are not intended to be used on the frontend to display information (this is the purpose of the `settings` key). This can be usefull if you want to add references to CMS links to edit entities used in that block.

## Cache TTL

The `Page.cache` property now have a `sharedTtl` key to be used in the `s-maxage` header field. `ttl` field is used for the `max-age` attribute.