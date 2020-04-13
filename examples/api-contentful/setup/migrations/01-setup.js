async function cleanSpace(makeRequest, migration) {
  const rendrTypes = [
    "rendr_author",
    "rendr_block_text",
    "rendr_block_raw_configuration",
    "rendr_block_header",
    "rendr_block_footer",
    "rendr_website",
    "rendr_page",
    "rendr_article",
  ];

  // Get all entries, and delete them if needed
  const entries = await makeRequest({
    method: "GET",
    url: "/entries",
  });

  // prebuild a collection of entries, entries need to be deleted on
  // a specifics orders due to dependency.
  const collections = {};
  entries.items.forEach((i) => {
    if (rendrTypes.includes(i.sys.contentType.sys.id)) {
      if (!collections[i.sys.contentType.sys.id]) {
        collections[i.sys.contentType.sys.id] = [];
      }

      collections[i.sys.contentType.sys.id].push(i.sys.id);
    }
  });

  const contentTypes = await makeRequest({
    method: "GET",
    url: "/content_types",
  });

  const installedTypes = contentTypes.items
    .map((element) => element.sys.id)
    .filter((id) => id.substr(0, 5) === "rendr");
  for (let x = 0; x < rendrTypes.length; x++) {
    const type = rendrTypes[x];

    if (!installedTypes.includes(type)) {
      continue;
    }

    if (collections[type]) {
      // entries to remove
      for (let index = 0; index < collections[type].length; index++) {
        try {
          await makeRequest({
            method: "DELETE",
            url: `/entries/${collections[type][index]}/published`,
          });
        } catch (err) {
          console.log(`Ignoring error (${err.message})`);
        }

        await makeRequest({
          method: "DELETE",
          url: `/entries/${collections[type][index]}`,
        });
      }
    }

    // delete related content type before deleted the content
    migration.deleteContentType(type);
  }
}

function createField(entity, id, name, opts = {}) {
  entity.createField(id, {
    localized: false,
    required: false,
    validations: [],
    disabled: false,
    omitted: false,
    ...opts,
    name,
  });
}

function createSymbol(entity, id, name, opts = {}) {
  createField(entity, id, name, { ...opts, type: "Symbol" });
}

function createBoolean(entity, id, name, opts = {}) {
  createField(entity, id, name, { ...opts, type: "Boolean" });
}

function createInteger(entity, id, name, opts = {}) {
  createField(entity, id, name, { ...opts, type: "Integer" });
}

function createText(entity, id, name, opts = {}) {
  createField(entity, id, name, { ...opts, type: "Text" });
}

function createAsset(entity, id, name, opts = {}) {
  createField(entity, id, name, {
    ...opts,
    type: "Link",
    validations: [],
    linkType: "Asset",
  });
}

function getDefaultContainerNames() {
  return ["header", "nav", "body", "aside", "footer"];
}

function createAuthor(migration) {
  const author = migration.createContentType("rendr_author", {
    name: "Rendr > Author",
    description: "Author used in pages or articles",
    displayField: "name",
  });

  createSymbol(author, "name", "Name", {
    required: true,
  });
  createSymbol(author, "job_title", "Job Title");
  createSymbol(author, "slug", "Slug", {
    required: true,
  });
  createSymbol(author, "social_twitter", "Twitter Account");
  createSymbol(author, "social_facebook", "Facebook Account");
  createSymbol(author, "social_linkedin", "Linkedin Account");
  createText(author, "biography", "Biography");
  createAsset(author, "image", "Image");
}

function createWebsite(migration) {
  const website = migration.createContentType("rendr_website", {
    name: "Rendr > Site",
    description: "Websites used by the platform",
    displayField: "name",
  });

  createSymbol(website, "name", "Name", {
    required: true,
  });
  createField(website, "domains", "Domains", {
    required: true,
    type: "Array",
    items: {
      type: "Symbol",
      validations: [],
    },
  });

  createSymbol(website, "path", "Path", {
    required: true,
  });

  createSymbol(website, "culture", "Culture");
  createSymbol(website, "country_code", "Country Code");
  createInteger(website, "order", "Order");
  createBoolean(website, "enabled", "Enabled", {
    required: true,
  });
}

function createDefault(migration, code, opts) {
  const block = migration.createContentType(code, {
    ...opts,
    displayField: "internal_title",
  });

  createSymbol(block, "internal_title", "Internal Title", {
    required: true,
  });
  createSymbol(block, "container", "Container", {
    required: true,
    validations: [
      {
        in: getDefaultContainerNames(),
      },
    ],
  });
  createInteger(block, "order", "Order");

  return block;
}

function createBasicBlocks(migration) {
  const blockText = createDefault(migration, "rendr_block_text", {
    name: "Rendr > Block > Text",
  });
  createSymbol(blockText, "title", "Title");
  createSymbol(blockText, "subtitle", "Sub-Title");
  createField(blockText, "contents", "Contents", {
    type: "Text",
  });
  createSymbol(blockText, "mode", "Mode", {
    required: false,
    validations: [
      {
        in: ["jumbotron", "standard", "image", "quote"],
      },
    ],
  });
  createAsset(blockText, "image", "Image");
  createSymbol(blockText, "image_position", "Image Position", {
    required: false,
    validations: [
      {
        in: ["left", "right"],
      },
    ],
  });

  const blockRawConfiguration = createDefault(
    migration,
    "rendr_block_raw_configuration",
    {
      name: "Rendr > Block > Raw Configuration",
    }
  );

  createField(blockRawConfiguration, "configuration", "Configuration", {
    type: "Object",
  });

  const blockHeader = createDefault(migration, "rendr_block_header", {
    name: "Rendr > Block > Header",
  });

  const blockFooter = createDefault(migration, "rendr_block_footer", {
    name: "Rendr > Block > Footer",
  });
}

function createArticle(migration) {
  const article = migration.createContentType("rendr_article", {
    name: "Rendr > Article",
    description: "Article",
    displayField: "title",
  });

  createSymbol(article, "title", "Page title", {
    required: true,
  });
  createSymbol(article, "type", "Type");
  createText(article, "abstract", "Abstract");
  createSymbol(article, "seo_description", "Seo Description");
  createSymbol(article, "seo_keywords", "Seo Keywords");

  createSymbol(article, "slug", "Slug", {
    required: true,
  });

  createField(article, "blocks", "Blocks", {
    type: "Array",
    items: {
      type: "Link",
      validations: [
        {
          linkContentType: ["rendr_block_text"],
        },
      ],
      linkType: "Entry",
    },
  });

  createField(article, "published_at", "Publication Date", {
    type: "Date",
    required: true,
  });

  createField(article, "authors", "Authors", {
    type: "Array",
    items: {
      type: "Link",
      validations: [
        {
          linkContentType: ["rendr_author"],
        },
      ],
      linkType: "Entry",
    },
  });

  createField(article, "website", "Website", {
    type: "Link",
    validations: [
      {
        linkContentType: ["rendr_website"],
      },
    ],
    linkType: "Entry",
  });

  createAsset(article, "image_list", "List image");
  createAsset(article, "image_header", "Header image");

  return article;
}

function createPage(migration) {
  const page = migration.createContentType("rendr_page", {
    name: "Rendr > Page",
    description: "Page with blocks",
    displayField: "title",
  });

  createSymbol(page, "title", "Page title", {
    required: true,
  });
  createSymbol(page, "seo_description", "Seo Description");
  createSymbol(page, "seo_keywords", "Seo Keywords");
  createSymbol(page, "extends", "Extends", {
    validations: [
      {
        in: ["root"],
      },
    ],
  });

  createSymbol(page, "path", "Path");
  createField(page, "website", "Website", {
    type: "Link",
    validations: [
      {
        linkContentType: ["rendr_website"],
      },
    ],
    linkType: "Entry",
  });

  createField(page, "blocks", "Blocks", {
    type: "Array",
    items: {
      type: "Link",
      validations: [
        {
          linkContentType: [
            "rendr_block_text",
            "rendr_block_raw_configuration",
            "rendr_block_header",
            "rendr_block_footer",
          ],
        },
      ],
      linkType: "Entry",
    },
  });

  createSymbol(page, "layout", "Layout", {
    required: true,
    validations: [
      {
        in: ["default", "error"],
      },
    ],
  });

  createInteger(page, "ttl", "Time-To-Live");

  createField(page, "published_at", "Publication Date", {
    type: "Date",
    required: true,
  });

  createField(page, "settings", "Settings", {
    type: "Object",
  });

  createSymbol(page, "code", "Code");

  return page;
}

module.exports = async function (
  migration,
  { makeRequest, spaceId, accessToken }
) {
  await cleanSpace(makeRequest, migration);

  createAuthor(migration);
  createBasicBlocks(migration);
  createWebsite(migration);
  createPage(migration);
  createArticle(migration);
};
