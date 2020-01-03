import { PageBuilder } from "@ekino/rendr-loader";
import { GetArticle } from "../helper/contents";

import {
  defaultContentfulClient,
  contentfulNormalizer
} from "../helper/contentful";
import { getPage } from "../helper/page";
import {
  NotFoundError,
  InternalServerError,
  BlockDefinition
} from "@ekino/rendr-core";

export const article: PageBuilder = async (ctx, page) => {
  // We first load the Article object from contentful
  const entry = await GetArticle(
    defaultContentfulClient(ctx),
    ctx.params["slug"],
    {
      domain: ctx.hostname
    }
  );

  // article does not exist, raise an error
  if (!entry) {
    throw new NotFoundError(
      `[Demo API] Unable to load the article - path: ${ctx.params["slug"]}, domain: ${ctx.hostname}`
    );
  }

  // we need first to get the page `/articles/:slug` from contentful, as it will hold
  // the current page structure for the whole page.
  const articlePage = await getPage(
    {
      ...ctx,
      // we need to load the correct page and it cannot be the original path
      // as it will change on all requests: "/articles/slug-1", "/articles/slug-2", etc ...
      pathname: "/articles/:slug"
    },
    page
  );
  articlePage.path = ctx.pathname;

  // the related layout page does not exist on contentful, so we cannot create the structure
  if (!articlePage) {
    // there is a serious issue here ...
    throw new InternalServerError(
      `[Demo API] Unable to find the article page on contentful - path: /articles/:slug, domain: ${ctx.hostname}`
    );
  }

  const article = contentfulNormalizer(entry);

  // at this point we have the Page and the Article, we need now the "merge" the article into the Page,
  // please remember, the current function must return a Page object corresponding to the final page.
  articlePage.head.title = article.title;

  articlePage.head.meta.push({
    keywords: article.seo.keywords
  });
  articlePage.head.meta.push({
    description: article.seo.description
  });

  // add related blocks for the page
  articlePage.blocks.push({
    container: "body",
    // for simplicity, the rendr.text block is used, however you can create
    // new type to match the layout block available (that you have to create depends on
    // the design)
    type: "rendr.text",
    settings: {
      title: article.title,
      contents: article.abstract
    },
    // set a low priority to component on the page (from contentful),
    // can be defined to be show before the main article
    order: 100
  });

  // the article is also composed from a set of block we can just reuse them
  article.blocks.forEach((block: BlockDefinition) => {
    block.order = 100 + block.order;
    articlePage.blocks.push(block);
  });

  // for now, authors and images are not in used.
  // authors: Author[];
  // images: {
  //   list: Asset;
  //   header: Asset;
  // };

  return articlePage;
};
