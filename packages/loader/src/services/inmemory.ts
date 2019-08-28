import { Page, RequestCtx, NotFoundError } from "@ekino/rendr-core";
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
    const result = routes.find(conf => {
      const { matcher, path } = conf;

      // @ts-ignore - definition does not exist...
      const params = matcher(ctx.pathname);

      if (!params) {
        return false;
      }

      ctx.params = params;

      return true;
    });

    if (!result) {
      throw new NotFoundError();
    }

    return await result.pageCreator(new Page(), ctx);
  };
}
