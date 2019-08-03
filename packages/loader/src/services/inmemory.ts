import { Page, RequestCtx } from "@ekino/rendr-core";
import { Loader, InMemorySettings, RouteConfiguration } from "../types";
// @ts-ignore - definition does not exist...
import createMatcher from "path-match";

const route = createMatcher({
  // path-to-regexp options
  sensitive: false,
  strict: true,
  end: true,
  start: true
});

export function createInMemoryLoader(paths: InMemorySettings): Loader {
  const routes: RouteConfiguration[] = [];

  // compute the route expression
  for (const path in paths) {
    if (!paths[path]) {
      continue;
    }

    routes.push({
      path,
      matcher: route(path),
      pageCreator: paths[path]
    });
  }

  return async (ctx: RequestCtx) => {
    ctx.params = {};
    const result = routes.find(conf => {
      const { matcher, path } = conf;

      // need to parse the query, to get the URL
      const query = ctx.asPath;

      // @ts-ignore - definition does not exist...
      const params = matcher(query);

      if (!params) {
        return false;
      }

      ctx.params = params;

      return true;
    });

    let page = new Page();

    if (!result) {
      // page not found
      // should generate a 404 page
      page.statusCode = 404;

      return page;
    }

    // to do, use the params value
    try {
      page = await result.pageCreator(new Page(), ctx);
    } catch (e) {
      // should generate a 500 page
      page.statusCode = 500;
    }

    return page;
  };
}
