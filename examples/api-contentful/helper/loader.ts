import {
  createInMemoryLoader,
  createChainedLoader,
  createErrorBoundaryLoader
} from "@ekino/rendr-loader";

import { createAggregatorLoader } from "@ekino/rendr-aggregator";

import * as Pages from "./../pages";
import * as Aggregators from "./../aggregators";

// define routes
const routes = {
  "/sitemap.xml": Pages.sitemap,
  "/articles/:slug": Pages.articleView,
  "/*": Pages.catchAll
};

// define aggregator functions
const aggregators = {
  "article.list": Aggregators.articles
};

// configure page loaders
export default createChainedLoader([
  createErrorBoundaryLoader(),
  createInMemoryLoader(routes),
  createAggregatorLoader(aggregators)
]);
