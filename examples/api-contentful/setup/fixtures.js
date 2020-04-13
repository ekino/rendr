const contentful = require("contentful-management");

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

async function create(env, ...args) {
  const result = await env.createEntry(...args);
  result.publish();

  return result;
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
      name: {
        "en-US": "Entry title",
      },
      domains: {
        "en-US": ["localhost", "127.0.0.1", "contentful-api.rande.now.sh"],
      },
      path: {
        "en-US": "/",
      },
      culture: {
        "en-US": "en_GB",
      },
      country_code: {
        "en-US": "GDB",
      },
      order: {
        "en-US": 1,
      },
      enabled: {
        "en-US": true,
      },
    },
  });

  const author = await create(env, "rendr_author", {
    fields: {
      name: {
        "en-US": "John Doe",
      },

      job_title: {
        "en-US": "Unknown",
      },
      slug: {
        "en-US": "john-doe",
      },
      biography: {
        "en-US": "may refer to an unidentified person",
      },
    },
  });

  for (let i = 0; i < 40; i++) {
    const block = await create(env, "rendr_block_text", {
      fields: {
        container: {
          "en-US": "body",
        },
        internal_title: {
          "en-US": "The main content of this article",
        },
        title: {
          "en-US": `The title of block rendr_block_text ${i}`,
        },
        contents: {
          "en-US":
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
      },
    });

    await create(env, "rendr_article", {
      fields: {
        title: {
          "en-US": `Article #${i}`,
        },
        abstract: {
          "en-US": `The super awesome abstract #${i}`,
        },
        seo_description: {
          "en-US": "The description",
        },
        seo_keywords: {
          "en-US": "The description",
        },
        slug: {
          "en-US": `slug-${i}`,
        },
        website: {
          "en-US": {
            sys: { type: "Link", linkType: "Entry", id: website.sys.id },
          },
        },
        blocks: {
          "en-US": [
            { sys: { type: "Link", linkType: "Entry", id: block.sys.id } },
          ],
        },
        authors: {
          "en-US": [
            { sys: { type: "Link", linkType: "Entry", id: author.sys.id } },
          ],
        },
        published_at: {
          "en-US": "2019-08-20T18:28:43.549Z",
        },
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
  const welcomeBlock = await create(env, "rendr_block_text", {
    fields: {
      title: {
        "en-US": "Homepage",
      },
      container: {
        "en-US": "body",
      },
      internal_title: {
        "en-US": "The welcoming message",
      },
      title: {
        "en-US": "Welcome",
      },
      contents: {
        "en-US": "This is the welcome text, enjoy this website",
      },
    },
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Homepage",
      },
      seo_description: {
        "en-US": "The homepage",
      },
      seo_keywords: {
        "en-US": "The homepage, awesome",
      },
      extends: {
        "en-US": "root",
      },
      path: {
        "en-US": "/",
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id },
        },
      },
      blocks: {
        "en-US": [
          { sys: { type: "Link", linkType: "Entry", id: welcomeBlock.sys.id } },
        ],
      },
      layout: {
        "en-US": "default",
      },
      ttl: {
        "en-US": 3600,
      },
      settings: {
        "en-US": {},
      },
      published_at: {
        "en-US": "2019-08-20T18:28:43.549Z",
      },
    },
  });
}

async function createAboutPage(env, website) {
  const aboutText = await create(env, "rendr_block_text", {
    fields: {
      container: {
        "en-US": "body",
      },
      internal_title: {
        "en-US": "The about message",
      },
      title: {
        "en-US": "About",
      },
      contents: {
        "en-US":
          "This is a demo website of the CMD integration with a rendering engine. If you want more information please go to ...",
      },
    },
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Homepage",
      },
      seo_description: {
        "en-US": "About page",
      },
      seo_keywords: {
        "en-US": "about",
      },
      extends: {
        "en-US": "root",
      },
      path: {
        "en-US": "/about",
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id },
        },
      },
      blocks: {
        "en-US": [
          { sys: { type: "Link", linkType: "Entry", id: aboutText.sys.id } },
        ],
      },
      layout: {
        "en-US": "default",
      },
      ttl: {
        "en-US": 3600,
      },
      settings: {
        "en-US": {},
      },
      published_at: {
        "en-US": "2019-08-20T18:28:43.549Z",
      },
    },
  });
}

async function createBasePage(env, website) {
  const headerBlock = await create(env, "rendr_block_header", {
    fields: {
      container: {
        "en-US": "header",
      },
      internal_title: {
        "en-US": "The header message",
      },
      order: {
        "en-US": 0,
      },
    },
  });

  const footerBlock = await create(env, "rendr_block_footer", {
    fields: {
      container: {
        "en-US": "footer",
      },
      internal_title: {
        "en-US": "The footer message",
      },
      order: {
        "en-US": 1000,
      },
    },
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Base page",
      },
      seo_description: {
        "en-US": "The homepage",
      },
      seo_keywords: {
        "en-US": "The homepage, awesome",
      },
      code: {
        "en-US": "root",
      },
      path: {
        "en-US": "/_/cms-root",
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id },
        },
      },
      blocks: {
        "en-US": [
          { sys: { type: "Link", linkType: "Entry", id: headerBlock.sys.id } },
          { sys: { type: "Link", linkType: "Entry", id: footerBlock.sys.id } },
        ],
      },
      layout: {
        "en-US": "default",
      },
      ttl: {
        "en-US": 3600,
      },
      settings: {
        "en-US": {},
      },
      published_at: {
        "en-US": "2019-08-20T18:28:43.549Z",
      },
    },
  });
}

async function createArticlePage(env, website) {
  const articleViewBlock = await create(env, "rendr_block_raw_configuration", {
    fields: {
      container: {
        "en-US": "body",
      },
      internal_title: {
        "en-US": "The article view",
      },
      configuration: {
        "en-US": {
          container: "body",
          order: 1,
          "settings:": {},
          type: "article.view",
        },
      },
    },
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Article View",
      },
      seo_description: {
        "en-US": "The description",
      },
      seo_keywords: {
        "en-US": "The description",
      },
      extends: {
        "en-US": "root",
      },
      path: {
        "en-US": "/articles/:slug",
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id },
        },
      },
      blocks: {
        "en-US": [
          {
            sys: {
              type: "Link",
              linkType: "Entry",
              id: articleViewBlock.sys.id,
            },
          },
        ],
      },
      layout: {
        "en-US": "default",
      },
      ttl: {
        "en-US": 3600,
      },
      settings: {
        "en-US": {},
      },
      published_at: {
        "en-US": "2019-08-20T18:28:43.549Z",
      },
    },
  });
}

async function createArticleListPage(env, website) {
  const articleListBlock = await create(env, "rendr_block_raw_configuration", {
    fields: {
      container: {
        "en-US": "body",
      },
      internal_title: {
        "en-US": "The article view",
      },
      configuration: {
        "en-US": {
          container: "body",
          order: 1,
          "settings:": {},
          type: "article.list",
        },
      },
    },
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Articles List",
      },
      seo_description: {
        "en-US": "The description",
      },
      seo_keywords: {
        "en-US": "The description",
      },
      extends: {
        "en-US": "root",
      },
      path: {
        "en-US": "/articles",
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id },
        },
      },
      blocks: {
        "en-US": [
          {
            sys: {
              type: "Link",
              linkType: "Entry",
              id: articleListBlock.sys.id,
            },
          },
        ],
      },
      layout: {
        "en-US": "default",
      },
      ttl: {
        "en-US": 3600,
      },
      settings: {
        "en-US": {},
      },
      published_at: {
        "en-US": "2019-08-20T18:28:43.549Z",
      },
    },
  });
}

loadFixtures();
