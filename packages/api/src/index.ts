import { Loader } from "@ekino/rendr-loader";
import {
  Page,
  RendrCtx,
  createPage,
  createResponsePage,
} from "@ekino/rendr-core";

// should return a middleware api to return page definition through http
export function createApi(loader: Loader) {
  return async (ctx: RendrCtx) => {
    const headers = {
      "X-Rendr-Content-Type": "rendr/octet-stream",
      "Content-Type": "application/octet-stream",
      "Cache-Control": "private, max-age=0, no-cache",
    };

    // a loader can also take over the response without
    // returning any page object: ie: streaming data to the client
    const page = await loader(
      ctx,
      createPage({ statusCode: 404 }),
      (page) => page
    );

    if (!(page instanceof Page)) {
      // can be a page redirection or a page response.
      return page;
    }

    headers["X-Rendr-Content-Type"] = "rendr/document";
    headers["Content-Type"] = "application/json";

    if (page.cache.ttl > 0 && page.statusCode == 200) {
      headers[
        "Cache-Control"
      ] = `public, max-age=${page.cache.ttl}, s-maxage=${page.cache.sharedTtl}`;
    }

    return createResponsePage(200, headers, JSON.stringify(page));
  };
}
