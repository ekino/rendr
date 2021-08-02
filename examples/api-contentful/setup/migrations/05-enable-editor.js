const contentful = require("contentful-management");
const shared = require("./shared");

module.exports = async function (migration, { spaceId, accessToken }) {
  const client = contentful.createClient({
    accessToken: accessToken,
  });

  const organisationId =
    process.env.CONTENTFUL_ORGANIZATION_ID ||
    (await shared.getOrganizationId(client));

  const organisation = await client.getOrganization(organisationId);
  const appDefinitions = await organisation.getAppDefinitions();

  // check if the app is defined
  let app = appDefinitions.items.find((appDef) => {
    return appDef.src.substr(0, 20) === "https://cf.ekino.app";
  });

  if (!app) {
    throw new Error("Unable to find the editor definition");
  }

  const types = [
    "rendr_website",
    "rendr_article",
    "rendr_page",
    "rendr_fragment",
    "rendr_author",
  ];

  for (const i in types) {
    const type = migration.editContentType(types[i]);

    type.configureEntryEditors([
      {
        widgetNamespace: "app",
        widgetId: app.sys.id,
        settings: {},
      },
      {
        widgetNamespace: "editor-builtin",
        widgetId: "tags-editor",
        settings: {},
      },
      {
        widgetNamespace: "editor-builtin",
        widgetId: "default-editor",
        settings: {},
      },
    ]);
  }
};
