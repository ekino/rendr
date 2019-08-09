function createField(entity, id, name, opts = {}) {
  entity.createField(id, {
    localized: false,
    required: false,
    validations: [],
    disabled: false,
    omitted: false,
    ...opts,
    name
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

function getDefaultContainerNames() {
  return ["header", "nav", "article", "aside", "footer"];
}

function createWebsite(migration) {
  const website = migration.createContentType("rendr_website", {
    name: "Rendr Site",
    description: "Websites used by the platform"
  });

  createSymbol(website, "name", "Name");
  createField(website, "domains", "Domains", {
    type: "Array",
    items: {
      type: "Symbol",
      validations: []
    }
  });

  createSymbol(website, "path", "Path");

  createSymbol(website, "culture", "Culture");
  createSymbol(website, "country_code", "Country Code");
  createSymbol(website, "order", "Order");
  createBoolean(website, "enabled", "Enabled");
}

function createBasicBlocks(migration) {
  const blockText = migration.createContentType("rendr_block_text", {
    name: "Rendr > Text Block"
  });

  createSymbol(blockText, "title", "Title");
  createSymbol(blockText, "container", "Container", {
    validations: [
      {
        in: getDefaultContainerNames()
      }
    ]
  });

  createField(blockText, "contents", "Contents", {
    type: "RichText"
  });

  const blockGallery = migration.createContentType("rendr_block_gallery", {
    name: "Rendr > Assets Gallery"
  });

  createSymbol(blockGallery, "title", "Title");
  createSymbol(blockGallery, "container", "Container", {
    validations: [
      {
        in: getDefaultContainerNames()
      }
    ]
  });

  createField(blockGallery, "gallery", "Gallery", {
    type: "Array",
    items: {
      type: "Link",
      validations: [
        {
          linkContentType: ["Asset"]
        }
      ],
      linkType: "Entry"
    }
  });
}

function createPage(migration) {
  const page = migration.createContentType("rendr_page", {
    name: "Rendr Page",
    description: "Page with blocks"
  });

  createSymbol(page, "title", "Page title");
  createSymbol(page, "seo_description", "Seo Description");
  createSymbol(page, "seo_keywords", "Seo Keyword");
  createSymbol(page, "extends", "Extends", {
    validations: [
      {
        in: ["root"]
      }
    ]
  });

  createSymbol(page, "path", "Path");
  createSymbol(page, "definition", "Definition");
  createField(page, "website", "Website", {
    type: "Link",
    validations: [
      {
        linkContentType: ["rendr_website"]
      }
    ],
    linkType: "Entry"
  });

  createField(page, "blocks", "Blocks", {
    type: "Array",
    items: {
      type: "Link",
      validations: [
        {
          linkContentType: ["rendr_block_text"]
        }
      ],
      linkType: "Entry"
    }
  });

  createSymbol(page, "templates", "Templates", {
    validations: [
      {
        in: ["default", "error"]
      }
    ]
  });

  createInteger(page, "ttl", "Time-To-Live");
  createField(page, "extras", "Extras", {
    type: "Object"
  });
}

module.exports = async function(migration) {
  migration.deleteContentType("rendr_block_text");
  migration.deleteContentType("rendr_block_gallery");
  migration.deleteContentType("rendr_page");
  migration.deleteContentType("rendr_website");

  createBasicBlocks(migration);
  createWebsite(migration);
  createPage(migration);
};
