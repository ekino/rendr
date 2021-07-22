const richTextOptions = {
  validations: [
    {
      enabledNodeTypes: [
        "heading-3",
        "heading-4",
        "heading-5",
        "heading-6",
        "ordered-list",
        "unordered-list",
        "hr",
        "blockquote",
        "embedded-entry-block",
        "hyperlink",
      ],
      message:
        "Only heading 3, heading 4, heading 5, heading 6, ordered list, unordered list, horizontal rule, quote, block entry, and link to Url nodes are allowed",
    },
    {
      nodes: {
        "embedded-entry-block": [
          {
            linkContentType: ["rendr_fragment"],
            message: null,
          },
        ],
      },
    },
  ],
};

const blocksDefaultOptions = {
  type: "Array",
  items: {
    type: "Link",
    validations: [
      {
        linkContentType: ["rendr_fragment"],
      },
    ],
    linkType: "Entry",
  },
};

async function cleanSpace(makeRequest, migration) {
  const rendrTypes = [
    "rendr_author",
    "rendr_block_text",
    "rendr_fragment",
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
  createField(entity, id, name, { ...opts, type: "Symbol" });
}

function createLongText(entity, id, name, opts = {}) {
  createField(entity, id, name, { ...opts, type: "Text" });
}

function createRichText(entity, id, name, opts = {}) {
  createField(entity, id, name, { ...opts, type: "RichText" });
}

function createAsset(entity, id, name, opts = {}) {
  createField(entity, id, name, {
    ...opts,
    type: "Link",
    validations: [],
    linkType: "Asset",
  });
}

function createAssets(entity, id, name, opts = {}) {
  createField(entity, id, name, {
    ...opts,
    type: "Array",
    validations: [],
    items: {
      type: "Link",
      validations: [],
      linkType: "Asset",
    },
  });
}

function getDefaultContainerNames() {
  return ["header", "nav", "body", "aside", "footer"];
}

function createAuthor(migration) {
  const author = migration.createContentType("rendr_author", {
    name: "🕸️ Author",
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
    name: "🕸️ Site",
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
  createInteger(website, "ttl", "Time-To-Live (Browser)");
  createInteger(website, "sharedTtl", "Time-To-Live (CDN)");

  createField(website, "main_menu", "Main Menu", {
    type: "Object",
  });

  createField(website, "settings", "Settings", {
    type: "Object",
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

  return block;
}

function createFragment(migration) {
  const fragment = createDefault(migration, "rendr_fragment", {
    name: "🧩 Fragment",
  });
  createSymbol(fragment, "title", "Title");
  createSymbol(fragment, "type", "Type ");
  createField(fragment, "json_1", "json_1", {
    type: "Object",
    localized: true,
  });
  createField(fragment, "json_2", "json_2", {
    type: "Object",
    localized: true,
  });
  createField(fragment, "json_3", "json_3", {
    type: "Object",
    localized: true,
  });

  createBoolean(fragment, "bool_1", "bool_1");
  createBoolean(fragment, "bool_2", "bool_2");
  createBoolean(fragment, "bool_3", "bool_3");

  createLongText(fragment, "long_text_1", "long_text_1");
  createLongText(fragment, "long_text_2", "long_text_2");
  createLongText(fragment, "long_text_3", "long_text_3");

  createRichText(fragment, "rich_text_1", "rich_text_1", richTextOptions);
  createRichText(fragment, "rich_text_2", "rich_text_2", richTextOptions);
  createRichText(fragment, "rich_text_3", "rich_text_3", richTextOptions);

  createAssets(fragment, "images_1", "images_1");
  createAssets(fragment, "images_2", "images_2");
  createAssets(fragment, "images_3", "images_3");

  createField(fragment, "fragments_1", "fragments_1", {
    type: "Array",
    items: {
      type: "Link",
      validations: [
        {
          linkContentType: ["rendr_fragment"],
        },
      ],
      linkType: "Entry",
    },
  });
}

function createArticle(migration) {
  const article = migration.createContentType("rendr_article", {
    name: "📝 Article",
    description: "Article",
    displayField: "title",
  });

  createSymbol(article, "title", "Page title", {
    required: true,
  });
  createSymbol(article, "type", "Type");
  createLongText(article, "abstract", "Abstract");
  createSymbol(article, "seo_description", "Seo Description");
  createSymbol(article, "seo_keywords", "Seo Keywords");

  createSymbol(article, "slug", "Slug", {
    required: true,
  });

  createRichText(article, "body", "Body", richTextOptions);

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
    name: "🕸️ Page",
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

  createField(page, "header_blocks", "Header Blocks", blocksDefaultOptions);
  createField(page, "nav_blocks", "Nav. Blocks", blocksDefaultOptions);
  createField(page, "body_blocks", "Body Blocks", blocksDefaultOptions);
  createField(page, "aside_blocks", "Aside Blocks", blocksDefaultOptions);
  createField(page, "footer_blocks", "Footer Blocks", blocksDefaultOptions);

  createSymbol(page, "layout", "Layout", {
    required: true,
    validations: [
      {
        in: ["default", "error"],
      },
    ],
  });

  createInteger(page, "ttl", "Time-To-Live (Browser)");
  createInteger(page, "sharedTtl", "Time-To-Live (CDN)");

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
  createFragment(migration);
  createWebsite(migration);
  createPage(migration);
  createArticle(migration);
};
