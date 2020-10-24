import {
  createPageReference as ref,
  createPageReferencesGenerator,
  RendrCtx,
  Page,
} from "@ekino/rendr-core";
import { createSitemapResponse } from "@ekino/rendr-sitemap";
import { GetPages } from "@ekino/rendr-loader-contentful";

import { GetArticles } from "../helper/contents";

import { defaultContentfulClient } from "../helper/contentful";

export const sitemap = (ctx: RendrCtx, page: Page) => {
  const generator = createPageReferencesGenerator({
    pages: () => pagesGenerator(ctx),
    articles: () => articlesGenerator(ctx),
  });

  return createSitemapResponse(generator);
};

/**
 * Return page list on contentful.
 */
async function* pagesGenerator(ctx: RendrCtx) {
  const baseUrl = `https://${ctx.req.hostname}`;
  const date = new Date();

  // for now we don't handle pagination...
  const options = {
    domain: ctx.req.hostname,
  };

  try {
    const entries = await GetPages(defaultContentfulClient(ctx), options);

    for (let i in entries.items) {
      const entry = entries.items[i];

      yield ref(`${baseUrl}${entry.fields.path}`, {
        priority: 0.5,
        lastmod: date,
      });
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * Return article available one contentful.
 */
async function* articlesGenerator(ctx: RendrCtx) {
  const baseUrl = `https://${ctx.req.hostname}`;
  const date = new Date();

  // for now we don't handle pagination...
  const options = {
    domain: ctx.req.hostname,
  };

  try {
    const entries = await GetArticles(defaultContentfulClient(ctx), options);

    for (let i in entries.items) {
      const entry = entries.items[i];

      yield ref(`${baseUrl}/articles/${entry.fields.slug}`, {
        priority: 0.5,
        lastmod: date,
      });
    }
  } catch (err) {
    console.log(err);
  }
}
