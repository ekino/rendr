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
        contents: "A page rendering engine built on top of React and NextJS."
      },
      order: 0
    });

    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        rawHtml: true,
        contents: `
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
  "/articles": (ctx, page) => {
    const list = [];
    for (let i = 0; i < 32; i++) {
      list.push(`<li><a href="/post/slug-${i}">Post ${i}</a></li>`);
    }

    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        rawHtml: true,
        contents: `<ul>${list.join("")}</ul>`
      }
    });

    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        rawHtml: true,
        contents: `<a href="/post/page/2">Next Page</a>`
      }
    });

    return page;
  },
  "/articles/page/:number": (ctx, page) => {
    // we have at least 2000 blog posts, 32 elements per page
    let pageNumber = ctx.params.number ? parseInt(ctx.params.number, 10) : 0;

    if (pageNumber > 2000 / 32) {
      page.blocks.push({
        container: "body",
        type: "rendr.text",
        settings: {
          contents: `No more blog post!`
        }
      });

      return page;
    }

    const list = [];
    for (let i = 0; i < 32; i++) {
      const x = pageNumber * 32 + i;
      list.push(`<li><a href="/post/slug-${x}">Post ${x}</a></li>`);
    }

    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        rawHtml: true,
        contents: `<ul>${list.join("")}</ul>`
      }
    });

    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        rawHtml: true,
        contents: `<a href="/post/page/${pageNumber + 1}">Next Page</a>`
      }
    });

    return page;
  },
  "/articles/:slug": (ctx, page) => {
    // add related blocks for the page
    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        contents: `You are asking for a post with slug: ${ctx.params.slug}`
      }
    });

    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        title: "Part 1",
        contents: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat`
      }
    });

    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        title: "Part 2",
        contents: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
      }
    });

    return page;
  },
  "/about": (ctx, page) => {
    // add related blocks for the page
    page.blocks.push({
      container: "body",
      type: "rendr.text",
      settings: {
        contents: "Hello, this a demo of the SSR stack with a dynamic layout"
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
        contents: `Error ${ctx.params.statusCode}`
      },
      order: 0
    });

    page.statusCode = +ctx.params.statusCode;

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
