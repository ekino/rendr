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

// This small function is used to catch error, so we can update
// page layout in case of error. The layout for errors should
// come from a static source - ie, hard coded, to avoid any
// error coming from the original datasources (datasource not available).
const basePageLoader = loader => {
  return ctx => {
    return loader(ctx).catch(err => {
      console.log("An error occurs while loading page", {
        message: err.message
      });

      // something wrong happen
      const page = rendrCore.createPage();

      page.statusCode = err instanceof rendrCore.NotFoundError ? 404 : 500;

      return page;
    });
  };
};

// Configure a page for each matching url. As it is only an example, the code only set in one file
// however for testing or maintenance this can be splitted in different file with proper unit tests.
module.exports.loader = basePageLoader(
  rendrLoader.createInMemoryLoader({
    "/articles": async (page, ctx) => {
      // We first get the articles from contentful
      const articles = await rendrContentful.GetArticles(
        contentfulFinder(ctx),
        {
          domain: ctx.hostname,
          limit: 32,
          page: "page" in ctx.query ? ctx.query.page : 1 // we can deal with the pagination like this.
        }
      );

      const articlesPage = await getPage(page, ctx);

      if (articles.length === 0) {
        // no article
        articlesPage.title = "Sorry, no article for now...";

        articlesPage.blocks.push({
          container: "article",
          settings: {
            title: "Sorry :(",
            message: "No article for now, please come back soon!!!"
          }
        });

        return articlesPage;
      }

      articlesPage.blocks.push({
        container: "article",
        settings: {
          title: "Articles list",
          message: "Please find the articles"
        },
        types: "rndr_block_text"
      });

      articles.items.forEach(entry => {
        const article = normalizer(entry);

        articlesPage.blocks.push({
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

      return articlesPage;
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
        throw new rendrCore.NotFoundError(
          `[Demo API] Unable to load the article - path: ${
            ctx.params["slug"]
          }, domain: ${ctx.hostname}`
        );
      }

      // we need first to get the page `/articles/:slug` from contentful, as it will hold
      // the current page structure for the whole page.
      const articlePage = await getPage(page, {
        ...ctx,
        // we need to load the correct page and it cannot be the original path
        // as it will change on all requests: "/articles/slug-1", "/articles/slug-2", etc ...
        pathname: "/articles/:slug"
      });
      articlePage.path = ctx.pathname;

      // the related layout page does not exist on contentful, so we cannot create the structure
      if (!articlePage) {
        // there is a serious issue here ...
        throw new rendrCore.InternalServerError(
          `[Demo API] Unable to find the article page on contentful - path: /articles/:slug, domain: ${ctx.hostname}`
        );
      }

      const article = normalizer(entry);

      // at this point we have the Page and the Article, we need now the "merge" the article into the Page,
      // please remember, the current function must return a Page object corresponding to the final page.
      articlePage.title = article.title;

      articlePage.head.meta.push({
        keywords: article.seo.keywords
      });
      articlePage.head.meta.push({
        description: article.seo.description
      });

      // add related blocks for the page
      articlePage.blocks.push({
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
        articlePage.blocks.push(block);
      });

      // for now, authors and images are not in used.
      // authors: Author[];
      // images: {
      //   list: Asset;
      //   header: Asset;
      // };

      return articlePage;
    },
    "/*": async (page, ctx) => {
      // catch all
      return await getPage(page, ctx);
    }
  })
);

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
  const pageFromContentful = await loader(ctx);

  // Now we have the page, you can either return the page coming from contentful
  // return pageFromContentful

  // or merge it with the default one provided by the code
  return rendrCore.mergePages([page, pageFromContentful]);
}
