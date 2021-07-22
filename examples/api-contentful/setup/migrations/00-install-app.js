const contentful = require("contentful-management");
const shared = require("./shared");

module.exports = async function (migration, { spaceId, accessToken }) {
  const client = contentful.createClient({
    accessToken: accessToken,
  });

  const organisationId =
    process.env.CONTENTFUL_ORGANIZATION_ID || (await shared.getOrganizationId(client));

  const organisation = await client.getOrganization(organisationId);
  const appDefinitions = await organisation.getAppDefinitions();

  // check if the app is defined
  let app = appDefinitions.items.find((appDef) => {
    return appDef.src.substr(0, 20) === "https://cf.ekino.app";
  });

  if (app) {
    console.log(
      "Ekino Contentful editor is already available in your organisation!\n"
    );
    console.log(`Current url: ${app.src}\n`);
    console.log("Please make sure you are using the latest version:");
    console.log(
      "Visit to check latest version: https://cf.ekino.app/editor/v/latest/docs\n"
    );
    // app already installed nothing to do
  } else {
    app = await client.rawRequest({
      method: "POST",
      url: `https://api.contentful.com/organizations/${organisationId}/app_definitions`,
      data: {
        name: "Ekino Contentful Editor",
        src: "https://cf.ekino.app/editor/v/0.2.6",
        locations: [
          {
            location: "entry-editor",
          },
          {
            location: "app-config",
          },
        ],
      },
    });

    console.log(
      "Ekino Contentful editor has been defined in your organisation!\n"
    );
    console.log(`Current url: ${app.src}\n`);
  }

  // check if the app is installed on the different environment
  const space = await client.getSpace(spaceId);
  const environments = await space.getEnvironments();

  for (let i in environments.items) {
    const env = environments.items[i];
    const installedApps = await client.rawRequest({
      method: "GET",
      url: `https://api.contentful.com/spaces/${spaceId}/environments/${env.sys.id}/app_installations`,
    });

    const installed = installedApps.items.find((item) => {
      return app.sys.id === item.sys.appDefinition.sys.id;
    });

    if (installed) {
      console.log(
        `> env: ${env.name} - Application is already installed, nothing to do!`
      );
      continue;
    }

    console.log(`> env: ${env.name} - Application not found...`);

    const result = await client.rawRequest({
      method: "PUT",
      url: `https://api.contentful.com/spaces/${spaceId}/environments/${env.sys.id}/app_installations/${app.sys.id}`,
      data: {
        parameters: {
          editorStructure:
            '{"rendr_article":{"general":{"label":"General","sections":[{"fields":["title","slug","type","abstract"]}]},"content":{"label":"Contents","sections":[{"fields":["blocks"]}]},"SEO":{"label":"SEO","sections":[{"fields":["seo_description","seo_keywords"]}]},"publishing":{"label":"Publishing options","sections":[{"fields":["image_list","image_header","published_at","authors","website"]}]}}}',
        },
      },
    });

    console.log(
      `> env: ${env.name} - Application has been installed with default rendr settings, please adjust!`
    );
  }
};
