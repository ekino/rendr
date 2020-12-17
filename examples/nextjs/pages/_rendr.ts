import { createPage } from "@ekino/rendr-rendering-nextjs";
import { createAggregatorLoader } from "@ekino/rendr-aggregator";
import {
  createApiLoader,
  createChainedLoader,
  Loader,
} from "@ekino/rendr-loader";

import { RendrCtx, BlockDefinition, Page } from "@ekino/rendr-core";

import RendrTemplate from "../templates/RendrTemplate";

import dynamic from "next/dynamic";

// Configure components used on pages. A component is a standard React component.
const components = {
  "article.list": dynamic(() => import("../components/NestedBlocks")),
  "article.view": dynamic(() => import("../components/NestedBlocks")),
  "rendr.text": dynamic(() => import("../components/RendrText")),
  "rendr.footer": dynamic(() => import("../components/RendrFooter")),
  "rendr.header": dynamic(() => import("../components/RendrHeader")),
};

// Configure the template available for the page. A template is a standard React component.
const templates = {
  // rendr: dynamic(() => import("../templates/RendrTemplate"))
  rendr: RendrTemplate,
  default: RendrTemplate,
};

// optional handlers, only use this if you need to add information into block
// ie: handlers aggregate values and set them into a block.
//  => Aggregation at the view level is not that good but can be useful in some cases.
const handlers = {
  "rendr.agencies": (block: BlockDefinition, ctx: RendrCtx, page: Page) =>
    Promise.resolve(block),
};

export const BUILD_VERSION = "_BUILD_VERSION_";

// initialize related code required to make the page works.
const apiLoader: Loader = async (ctx, page, next) => {
  let url = "";

  if (ctx.isClientSide) {
    url = `${location.origin}/api`;
  } else if (ctx.req.headers["x-original-route"]) {
    // are we on platform.sh ?
    url = `https://${ctx.req.hostname}/api`;
  } else if (ctx.req.headers["x-now-deployment-url"]) {
    // are we on now.sh ?
    url = `https://${ctx.req.headers["x-now-deployment-url"]}/api`;
  } else {
    url = "http://localhost:3000/api";
  }

  const loader = createApiLoader(url, (url, options) => {
    options.params = {
      _build_version: BUILD_VERSION,
    };

    return { url, options };
  });

  return await loader(ctx, page, next);
};

const pageAggregator = createAggregatorLoader(handlers);

// define the loader to get the page definitioin
const loader = createChainedLoader([apiLoader, pageAggregator]);

// define the loader to encapsulate the NextJs response.

export default createPage(components, templates, loader);
