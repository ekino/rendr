const contentful = require("contentful-management");

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
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
        type: entry.sys.contentType.sys.id
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
        "en-US": "Entry title"
      },
      domains: {
        "en-US": ["localhost"]
      },
      path: {
        "en-US": "/"
      },
      culture: {
        "en-US": "en_GB"
      },
      country_code: {
        "en-US": "GDB"
      },
      order: {
        "en-US": 1
      },
      enabled: {
        "en-US": true
      }
    }
  });

  const author = await create(env, "rendr_author", {
    fields: {
      name: {
        "en-US": "John Doe"
      },

      job_title: {
        "en-US": "Unknown"
      },
      slug: {
        "en-US": "john-doe"
      },
      biography: {
        "en-US": "may refer to an unidentified person"
      }
    }
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Articles List"
      },
      seo_description: {
        "en-US": "The description"
      },
      seo_keywords: {
        "en-US": "The description"
      },
      extends: {
        "en-US": "root"
      },
      path: {
        "en-US": "/articles"
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id }
        }
      },
      layout: {
        "en-US": "default"
      },
      ttl: {
        "en-US": 3600
      },
      settings: {
        "en-US": {}
      }
    }
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Article View"
      },
      seo_description: {
        "en-US": "The description"
      },
      seo_keywords: {
        "en-US": "The description"
      },
      extends: {
        "en-US": "root"
      },
      path: {
        "en-US": "/articles/:slug"
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id }
        }
      },
      layout: {
        "en-US": "default"
      },
      ttl: {
        "en-US": 3600
      },
      settings: {
        "en-US": {}
      }
    }
  });

  const welcomeBlock = await create(env, "rendr_block_text", {
    fields: {
      title: {
        "en-US": "Homepage"
      },
      container: {
        "en-US": "article"
      },
      internal_title: {
        "en-US": "The welcoming message"
      },
      title: {
        "en-US": "Welcome"
      },
      contents: {
        "en-US": "This is the welcome text, enjoy this website"
      }
    }
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Homepage"
      },
      seo_description: {
        "en-US": "The homepage"
      },
      seo_keywords: {
        "en-US": "The homepage, awesome"
      },
      extends: {
        "en-US": "root"
      },
      path: {
        "en-US": "/"
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id }
        }
      },
      blocks: {
        "en-US": [
          { sys: { type: "Link", linkType: "Entry", id: welcomeBlock.sys.id } }
        ]
      },
      layout: {
        "en-US": "default"
      },
      ttl: {
        "en-US": 3600
      },
      settings: {
        "en-US": {}
      }
    }
  });

  const footerBlock = await create(env, "rendr_block_text", {
    fields: {
      container: {
        "en-US": "footer"
      },
      internal_title: {
        "en-US": "The footer message"
      },
      contents: {
        "en-US": "The footer defined on the website"
      }
    }
  });

  await create(env, "rendr_page", {
    fields: {
      title: {
        "en-US": "Base page"
      },
      seo_description: {
        "en-US": "The homepage"
      },
      seo_keywords: {
        "en-US": "The homepage, awesome"
      },
      code: {
        "en-US": "root"
      },
      path: {
        "en-US": "/_/cms-root"
      },
      website: {
        "en-US": {
          sys: { type: "Link", linkType: "Entry", id: website.sys.id }
        }
      },
      blocks: {
        "en-US": [
          { sys: { type: "Link", linkType: "Entry", id: footerBlock.sys.id } }
        ]
      },
      layout: {
        "en-US": "default"
      },
      ttl: {
        "en-US": 3600
      },
      settings: {
        "en-US": {}
      }
    }
  });
};

loadFixtures();
