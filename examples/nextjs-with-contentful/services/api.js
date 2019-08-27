// Please note this file is not used by the NextJS server.
// it is used by the API server to generate a page object ready to be consume
// by the NextJS rendering engine (or any other implementation).

const contentful = require("contentful");
const rendrLoader = require("@ekino/rendr-loader");
const rendrCore = require("@ekino/rendr-core");
const rendrContentful = require("@ekino/rendr-loader-contentful");

const contentfulFinder = ctx => {
  // you can use the ctx object to change the client
  // ie: to either use the public API or the preview API.
  return contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    environmentId: process.env.CONTENTFUL_ENV || "master",
    yes: true
  });
};

// this function create a normalizer function used to
// clean the contentful data, ie: remove custom information from contentful.
// @ekino/rendr-loader-contentful already have a set of bultin ones.
const normalizer = rendrContentful.createNormalizer();

// create the loader, that will retrieve the Page object from contentful.
const loader = rendrContentful.createContentfulLoader(
  contentfulFinder,
  normalizer
);

// Configure a page for each matching url. As it is only an example, the code only set in one file
// however for testing or maintenance this can be splitted in different file with proper unit tests.
module.exports.loader = rendrLoader.createInMemoryLoader({
  "/articles": async (page, ctx) => {
    // We first get the articles from contentful
    const articles = await rendrContentful.GetArticles(contentfulFinder(ctx), {
      domain: ctx.hostname,
      limit: 32,
      page: "page" in ctx.query ? ctx.query.page : 1 // we can deal with the pagination like this.
    });

    if (articles.length === 0) {
      // no article
      page.title = "Sorry, no article for now...";

      page.blocks.push({
        container: "article",
        settings: {
          title: "Sorry :(",
          message: "No article for now, please come back soon!!!"
        }
      });

      return page;
    }

    page.title = "Articles list";
    page.blocks.push({
      container: "article",
      settings: {
        title: "Articles list",
        message: "Please find the articles"
      },
      types: "rndr_block_text"
    });

    articles.items.forEach(entry => {
      const article = normalizer(entry);

      page.blocks.push({
        container: "article",
        settings: {
          title: article.title,
          // you can use this part to limit the size of the abstract if you want.
          message: article.abstract,
          link: {
            title: article.title,
            href: `/articles/${article.slug}`
          }
        },
        types: "rndr_block_text"
      });
    });

    return page;
  },
  "/articles/:slug": async (page, ctx) => {
    // We first load the Article object from contentful
    const entry = await rendrContentful.GetArticle(
      contentfulFinder(ctx),
      ctx.params["slug"],
      {
        domain: ctx.hostname
      }
    );

    // article does not exist, raise an error
    if (!entry) {
      throw rendrCore.NotFoundError;
    }

    // we need first to get the page `/post/:slug` from contentful, as it will hold
    // the current page structure for the whole page.
    const postPage = await getPage(page, {
      ...ctx,
      // we need to load the correct page and it cannot be the original path
      // as it will change on all requests: "/post/slug-1", "/post/slug-2", etc ...
      pathname: "/articles/:slug"
    });

    // the related layout page does not exist on contentful, so we cannot create the structure
    if (!postPage) {
      throw rendrCore.InternalServerError; // it a serious issue here ...
    }

    const article = normalizer(entry);

    // at this point we have the Page and the Article, we need now the "merge" the article into the Page,
    // please remember, the current function must return a Page object corresponding to the final page.
    postPage.title = article.title;

    postPage.head.meta.push({
      keywords: article.seo.keywords
    });
    postPage.head.meta.push({
      description: article.seo.description
    });

    // add related blocks for the page
    postPage.blocks.push({
      container: "article",
      // for simplicity, the rendr.text block is used, however you can create
      // new type to match the layout block available (that you have to create depends on
      // the design)
      type: "rendr.text",
      settings: {
        title: article.title,
        message: article.abstract
      },
      // set a low priority to component on the page (from contentful),
      // can be defined to be show before the main article
      order: 100
    });

    // the article is also composed from a set of block we can just reuse them
    article.blocks.forEach(block => {
      block.order = 100 + block.order;
      postPage.blocks.push(block);
    });

    // for now, authors and images are not in used.
    // authors: Author[];
    // images: {
    //   list: Asset;
    //   header: Asset;
    // };

    return postPage;
  },
  "/*": async (page, ctx) => {
    // catch all
    return await getPage(page, ctx);
  }
});

/**
 * We create this small helper functions just to avoid code duplication
 * but allow you to customize it depends on your needs.
 *
 * @param {rendrCore.Page} page
 * @param {rendrCore.RequestCtx} ctx
 */
async function getPage(page, ctx) {
  // retrieve the page from the loader,
  // as a side note this code work with any loaders, not only contentful ...
  // as long as the loader return a Page object.
  let pageFromContentful;
  try {
    pageFromContentful = await loader(ctx);
  } catch (err) {
    console.log(err);
    throw rendrCore.InternalServerError;
  }

  if (!pageFromContentful) {
    // no page found, it up to the caller to deal with that
    // so we just throw a NotFoundError.
    throw rendrCore.NotFoundError;
  }

  // Now we have the page, you can either return the page coming from contentful
  // return pageFromContentful

  // or merge it with the default one provided by the code
  return rendrCore.mergePages([page, pageFromContentful]);
}
