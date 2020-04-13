import {
  defaultContentfulClient,
  contentfulNormalizer,
} from "../helper/contentful";

import { GetArticles } from "../helper/contents";

import { BlockDefinition, RequestCtx } from "@ekino/rendr-core";

export const articles = async (
  definition: BlockDefinition,
  ctx: RequestCtx
) => {
  // We first get the articles from contentful
  const articles = await GetArticles(defaultContentfulClient(ctx), {
    domain: ctx.hostname,
    limit: 32,
    page: "page" in ctx.query ? ctx.query.page : 1, // we can deal with the pagination like this.
  });

  definition.settings.blocks = [];

  // @ts-ignore - length does not exists in the definition
  if (articles.length === 0) {
    // no article
    // articlesPage.head.title = "Sorry, no article for now...";

    definition.settings.blocks.push({
      container: "body",
      type: "rendr.text",
      order: 1,
      settings: {
        title: "Sorry :(",
        contents: "No article for now, please come back soon!!!",
      },
    });

    return;
  }

  definition.settings.blocks.push({
    container: "body",
    settings: {
      title: "Articles list",
      contents: "Please find the articles",
    },
    order: 1,
    type: "rendr.text",
  });

  articles.items.forEach((entry, i) => {
    const article = contentfulNormalizer(entry);

    definition.settings.blocks.push({
      container: "body",
      settings: {
        title: article.title,
        // you can use this part to limit the size of the abstract if you want.
        contents: article.abstract,
        link: {
          title: article.title,
          href: `/articles/${article.slug}`,
        },
      },
      order: i,
      type: "rendr.text",
    });
  });

  return definition;
};
