const rendrLoader = require("@ekino/rendr-loader");
const rendrSitemap = require("@ekino/rendr-sitemap");

const sitemap = require("./sitemap");

/**
 * Configure the default page, which can be used to define the base information for all pages.
 * Great way to define the header and the footer for instance.
 *
 * @param {Page} page
 * @param {import('@ekino/rendr-core').RequestCtx} ctx
 */
function basePageLoader(ctx, page, next) {
  page.template = "rendr";
  page.path = ctx.pathname;
  page.head.titleTemplate = "Ekino - %s";

  page.blocks.push({
    container: "header",
    type: "rendr.header",
    settings: {},
    order: 0
  });

  page.blocks.push({
    container: "footer",
    type: "rendr.footer",
    settings: {},
    order: 0
  });

  return next();
}

const routes = {
  "(/|)": (ctx, page) => {
    // add related blocks for the page
    page.blocks.push({
      container: "body",
      type: "rendr.jumbotron",
      settings: {
        title: "Rendr (by ekino.)",
        message: "A page rendering engine built on top of React and NextJS."
      },
      order: 0
    });

    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        rawHtml: true,
        message: `
          Rendr provides a solution to build configurable pages by using optional chainable services: 
          <ul>
            <li>page loader</li>
            <li>aggregator to enrich component with external data</li>
            <li>the template rendering engine</li>
          </ul>

          Rendr leverage the NextJS framework (DX, performance, code splitting).
        `
      },
      order: 0
    });

    return page;
  },
  "/post/:slug": (ctx, page) => {
    // add related blocks for the page
    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        message: `You are asking for a post with slug: ${ctx.params.slug}`,
        link: {
          href: `/post/${Math.random()
            .toString(36)
            .substring(7)}`,
          title: `next article`
        }
      },
      order: 0
    });

    return page;
  },
  "/about": (ctx, page) => {
    // add related blocks for the page
    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        message: "Hello, this a demo of the SSR stack with a dynamic layout"
      },
      order: 0
    });

    return page;
  },
  "/error/:statusCode": (ctx, page) => {
    // add related blocks for the page
    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        message: `Error ${ctx.params.statusCode}`
      },
      order: 0
    });

    page.statusCode = ctx.params.statusCode;

    return page;
  },
  "/humans.txt": (ctx, page) => {
    ctx.res.writeHead(200, {
      "Content-Type": "text/plain"
    });

    ctx.res.write(`/* TEAM */
    Chef:Thomas Rabaix
    Contact: thomas.rabaix@ekino.com
    From:Planet Earth
  
  /* SITE */
    Built with: ReactJs, nodejs, webpack
    Hosted on: AWS with ECS
    Cached with nginx`);

    ctx.res.end();

    return;
  },
  "/sitemap.xml": rendrSitemap.createSitemapPageBuilder(sitemap.generator)
};

// Configure a page for each matching url.
module.exports.loader = rendrLoader.createChainedLoader([
  rendrLoader.errorBoundaryLoader,
  basePageLoader,
  rendrLoader.createInMemoryLoader(routes)
]);
