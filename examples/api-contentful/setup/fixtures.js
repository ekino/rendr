const contentful = require("contentful-management");

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

async function create(env, ...args) {
  const result = await env.createEntry(...args);
  result.publish();

  return result;
}

function f(v, lang = "en-US") {
  return {
    [lang]: v,
  };
}

const loadFixtures = async () => {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  const env = await space.getEnvironment(
    process.env.CONTENTFUL_ENV || "master"
  );

  const entries = await env.getEntries({});

  let cpt = 0;
  for (let i = 0; i < entries.items.length; i++) {
    const entry = entries.items[i];
    if (
      entry.sys.contentType.sys.id.length > 6 &&
      entry.sys.contentType.sys.id.substr(0, 6) === "rendr_"
    ) {
      cpt++;
      console.log("try to delete entry", {
        id: entry.sys.id,
        type: entry.sys.contentType.sys.id,
      });
      try {
        await entry.unpublish();
      } catch (err) {
        // console.log(err);
      }

      await entry.delete();
    }
  }

  console.log(`Delete ${cpt} entries (starting by 'rendr_')`);

  const website = await create(env, "rendr_website", {
    fields: {
      name: f("Default Website"),
      domains: f([
        "localhost",
        "127.0.0.1",
        "contentful.api.demo.master-7rqtwti-g4cifmmuhuaz2.eu-4.platformsh.site",
        "nextjs.view.demo.master-7rqtwti-g4cifmmuhuaz2.eu-4.platformsh.site",
        "nextjs.view.demo.develop-sr3snxi-g4cifmmuhuaz2.eu-4.platformsh.site",
        "contentful.api.demo.develop-sr3snxi-g4cifmmuhuaz2.eu-4.platformsh.site",
      ]),
      seo: f({
        title: "The default SEO title for all pages",
        description: "The default description for all pages",
        twitter: {
          card: "summary",
        },
      }),
      path: f("/"),
      culture: f("en_GB"),
      country_code: f("GDB"),
      order: f(1),
      enabled: f(true),
    },
  });

  const author = await create(env, "rendr_author", {
    fields: {
      name: f("John Doe"),
      job_title: f("Unknown"),
      slug: f("john-doe"),
      biography: f("may refer to an unidentified person"),
    },
  });

  for (let i = 0; i < 4; i++) {
    const richText = {
      data: {},
      content: [
        {
          data: {},
          content: [
            {
              data: {},
              marks: [],
              value:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna elit aliqua. Ut enim elit ad. Ut enim elit ad minim veniam, quis nostrud.",
              nodeType: "text",
            },
          ],
          nodeType: "paragraph",
        },
      ],
      nodeType: "document",
    };

    const seo = {
      image: {
        url:
          "//images.ctfassets.net/4f3d8xgkdmfk/4fLXaq0tOHpyuyMh9eMQID/7bed3ede2f21195e6d2ad6886353cfa2/cloudflare-worker-logo.png",
        details: {
          size: 663588,
          image: {
            width: 1000,
            height: 1000,
          },
        },
        fileName: "cloudflare-worker-logo.png",
        contentType: "image/png",
        title: "Cloudflare logo",
        status: "published",
        id: "4fLXaq0tOHpyuyMh9eMQID",
      },
      title: "The page",
      description: "The descriptioni",
      og: {
        title: "og title",
        description: "og descriptioin",
      },
      twitter: {
        card: "summary",
      },
    };

    await create(env, "rendr_article", {
      fields: {
        title: f(`Article #${i}`),
        abstract: f(`The super awesome abstract #${i}`),
        seo: f(seo),
        slug: f(`slug-${i}`),
        website: f({
          sys: { type: "Link", linkType: "Entry", id: website.sys.id },
        }),
        body: f(richText),
        authors: f([
          { sys: { type: "Link", linkType: "Entry", id: author.sys.id } },
        ]),
        published_at: f("2019-08-20T18:28:43.549Z"),
      },
    });
  }

  await createHomePage(env, website);
  await createAboutPage(env, website);
  await createBasePage(env, website);
  await createArticlePage(env, website);
  await createArticleListPage(env, website);
};

async function createHomePage(env, website) {
  const welcomeBlock = await create(env, "rendr_fragment", {
    fields: {
      internal_title: f("The welcoming message"),
      title: f("Welcome"),
      type: f("Rendr Text"),
      rich_text_1: f({
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value: "This is the welcome text, enjoy this website.",
                nodeType: "text",
              },
            ],
            nodeType: "paragraph",
          },
        ],
        nodeType: "document",
      }),
    },
  });

  const seo = {
    image: {
      url:
        "//images.ctfassets.net/4f3d8xgkdmfk/4fLXaq0tOHpyuyMh9eMQID/7bed3ede2f21195e6d2ad6886353cfa2/cloudflare-worker-logo.png",
      details: {
        size: 663588,
        image: {
          width: 1000,
          height: 1000,
        },
      },
      fileName: "cloudflare-worker-logo.png",
      contentType: "image/png",
      title: "Cloudflare logo",
      status: "published",
      id: "4fLXaq0tOHpyuyMh9eMQID",
    },
    title: "The homepage",
    description: "The homepage description",
    og: {
      title: "og title",
      description: "og description",
    },
    twitter: {
      card: "summary",
    },
  };

  await create(env, "rendr_page", {
    fields: {
      title: f("Homepage"),
      seo: f(seo),
      extends: f("root"),
      path: f("/"),
      website: f({
        sys: { type: "Link", linkType: "Entry", id: website.sys.id },
      }),
      body_blocks: f([
        { sys: { type: "Link", linkType: "Entry", id: welcomeBlock.sys.id } },
      ]),
      layout: f("default"),
      settings: f({}),
      published_at: f("2019-08-20T18:28:43.549Z"),
    },
  });
}

async function createAboutPage(env, website) {
  const aboutText = await create(env, "rendr_fragment", {
    fields: {
      internal_title: f("The about message"),
      title: f("About"),
      type: f("Rendr Text"),
      rich_text_1: f({
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value:
                  "This is a demo website of the CMD integration with a rendering engine. If you want more information please go to ...",
                nodeType: "text",
              },
            ],
            nodeType: "paragraph",
          },
        ],
        nodeType: "document",
      }),
    },
  });

  const seo = {
    title: "About Us",
    description: "Discover who we are.",
    og: {
      title: "og title",
      description: "og description",
    },
    twitter: {
      card: "summary",
    },
  };

  await create(env, "rendr_page", {
    fields: {
      title: f("About Page"),
      seo: f(seo),
      extends: f("root"),
      path: f("/about"),
      website: f({
        sys: { type: "Link", linkType: "Entry", id: website.sys.id },
      }),
      body_blocks: f([
        { sys: { type: "Link", linkType: "Entry", id: aboutText.sys.id } },
      ]),
      layout: f("default"),
      settings: f({}),
      published_at: f("2019-08-20T18:28:43.549Z"),
    },
  });
}

async function createBasePage(env, website) {
  const headerBlock = await create(env, "rendr_fragment", {
    fields: {
      title: f("Header"),
      internal_title: f("The Header fragment"),
      title: f("Header"),
      type: f("Rendr > Header"),
    },
  });

  const footerBlock = await create(env, "rendr_fragment", {
    fields: {
      title: f("Footer"),
      internal_title: f("The Footer fragment"),
      title: f("Footer"),
      type: f("Rendr > Footer"),
    },
  });

  const seo = {};

  await create(env, "rendr_page", {
    fields: {
      title: f("Base page"),
      seo: f(seo),
      code: f("root"),
      path: f("/_/cms-root"),
      website: f({
        sys: { type: "Link", linkType: "Entry", id: website.sys.id },
      }),
      header_blocks: f([
        { sys: { type: "Link", linkType: "Entry", id: headerBlock.sys.id } },
      ]),
      footer_blocks: f([
        { sys: { type: "Link", linkType: "Entry", id: footerBlock.sys.id } },
      ]),
      layout: f("default"),
      settings: f({}),
      published_at: f("2019-08-20T18:28:43.549Z"),
    },
  });
}

async function createArticlePage(env, website) {
  const articleViewBlock = await create(env, "rendr_fragment", {
    fields: {
      internal_title: f("The article view"),
      type: f("Rendr Raw Config."),
      json_1: f({
        "settings:": {},
        type: "article.view",
      }),
    },
  });

  const seo = {
    title: "This should be overwritten by code using article metadata.",
    description: "This should be overwritten by code using article metadata.",
    og: {
      title: "og title",
      description: "og description",
    },
    twitter: {
      card: "summary",
    },
  };

  await create(env, "rendr_page", {
    fields: {
      title: f("Article View"),
      seo: f(seo),
      extends: f("root"),
      path: f("/articles/:slug"),
      website: f({
        sys: { type: "Link", linkType: "Entry", id: website.sys.id },
      }),
      body_blocks: f([
        {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: articleViewBlock.sys.id,
          },
        },
      ]),
      layout: f("default"),
      settings: f({}),
      published_at: f("2019-08-20T18:28:43.549Z"),
    },
  });
}

async function createArticleListPage(env, website) {
  const articleListBlock = await create(env, "rendr_fragment", {
    fields: {
      internal_title: f("The article list"),
      type: f("Rendr Raw Config."),
      json_1: f({
        "settings:": {},
        type: "article.list",
      }),
    },
  });

  const seo = {
    title: "List of articles",
    description: "Enjoy this currated list of articles.",
    og: {
      title: "og title",
      description: "og description",
    },
    twitter: {
      card: "summary",
    },
  };

  await create(env, "rendr_page", {
    fields: {
      title: f("Articles List"),
      seo: f(seo),
      extends: f("root"),
      path: f("/articles"),
      website: f({
        sys: { type: "Link", linkType: "Entry", id: website.sys.id },
      }),
      body_blocks: f([
        {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: articleListBlock.sys.id,
          },
        },
      ]),
      layout: f("default"),
      settings: f({}),
      published_at: f("2019-08-20T18:28:43.549Z"),
    },
  });
}

loadFixtures();
