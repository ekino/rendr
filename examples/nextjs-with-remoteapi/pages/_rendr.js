// @ts-check

import { createPage } from "@ekino/rendr-rendering-nextjs";
import { createAggregator } from "@ekino/rendr-aggregator";
import { createApiLoader } from "@ekino/rendr-loader";

import dynamic from "next/dynamic";

import RendrTemplate from "../templates/RendrTemplate";

// Configure components used on pages. A component is a standard React component.
const components = {
  "rendr.text": dynamic(() => import("../components/RendrText")),
  "rendr.footer": dynamic(() => import("../components/RendrFooter")),
  "rendr.header": dynamic(() => import("../components/RendrHeader")),
  "rendr.intro": dynamic(() => import("../components/RendrIntro")),
  "rendr.jumbotron": dynamic(() => import("../components/RendrJumbotron"))
};

// Configure the template available for the page. A template is a standard React component.
const templates = {
  // rendr: dynamic(() => import("../templates/RendrTemplate"))
  rendr: RendrTemplate
};

// optional handlers, only use this if you need to add information into block
// ie: handlers aggregate values and set them into a block.
//  => Aggregation at the view level is not that good but can be useful in some cases.
const handlers = {
  "rendr.agencies": (block, ctx) => Promise.resolve(block)
};

// initialize related code required to make the page works.
const apiLoader = createApiLoader("http://localhost:3000/api");
const pageAggregator = createAggregator(handlers);

const loader = async ctx => {
  // load the page from the memory
  let page = await apiLoader(ctx);

  if (!page) {
    return;
  }

  // once page has been loaded, we aggregate data if handler exist
  page = await pageAggregator(page, ctx);

  return page;
};

export default createPage(components, templates, loader);
