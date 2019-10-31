import { RequestCtx, Page } from "@ekino/rendr-core";
import {
  createInMemoryLoader,
  createChainedLoader,
  errorBoundaryLoader
} from "@ekino/rendr-loader";

import { articleList } from "./page-builders/article-list";
import { article } from "./page-builders/article";
import { getPage } from "./services-tools";

const routes = {
  "/articles": articleList,
  "/articles/:slug": article,
  "/*": async (ctx: RequestCtx, page: Page) => {
    // catch all
    return await getPage(page, ctx);
  }
};

export default {
  loader: createChainedLoader([
    errorBoundaryLoader,
    createInMemoryLoader(routes)
  ])
};
