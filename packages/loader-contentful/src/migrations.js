const runMigration = require("contentful-migration/built/bin/cli").runMigration;

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environmentId: process.env.CONTENTFUL_ENV || "master",
  yes: true
};

async function run(name) {
  await runMigration({
    ...options,
    ...{ filePath: `${__dirname}/migrations/${name}.js` }
  });
}

const migrations = async () => {
  await run("01-setup");
  await run("02-update-published-at");
  await run("03-update-slug");
};

migrations();
