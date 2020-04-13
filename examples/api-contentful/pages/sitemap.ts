import {
  createPageReference as ref,
  createPageReferencesGenerator,
  RequestCtx,
  Page,
} from "@ekino/rendr-core";
import { createSitemapPageBuilder } from "@ekino/rendr-sitemap";
import { GetPages } from "@ekino/rendr-loader-contentful";

import { GetArticles } from "../helper/contents";

import { defaultContentfulClient } from "../helper/contentful";

export const sitemap = (ctx: RequestCtx, page: Page) => {
  const generator = createPageReferencesGenerator({
    pages: () => pagesGenerator(ctx),
    articles: () => articlesGenerator(ctx),
  });

  return createSitemapPageBuilder(generator)(ctx, page);
};

/**
 * Return page list on contentful.
 */
async function* pagesGenerator(ctx: RequestCtx) {
  const baseUrl = `https://${ctx.hostname}`;
  const date = new Date();

  // for now we don't handle pagination...
  const options = {
    domain: ctx.hostname,
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
async function* articlesGenerator(ctx: RequestCtx) {
  const baseUrl = `https://${ctx.hostname}`;
  const date = new Date();

  // for now we don't handle pagination...
  const options = {
    domain: ctx.hostname,
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
