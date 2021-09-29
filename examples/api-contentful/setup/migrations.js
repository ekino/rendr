const runMigration = require("contentful-migration/built/bin/cli").runMigration;

const options = {
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  environmentId: process.env.CONTENTFUL_ENV || "master",
  yes: true,
};

async function run(name) {
  await runMigration({
    ...options,
    ...{ filePath: `${__dirname}/migrations/${name}.js` },
  });
}

const files = [
  "00-install-app",
  "01-setup",
  "02-update-published-at",
  "03-update-slug",
  "04-update-bulk",
  "05-enable-editor",
];

(async () => {
  for (let i in files) {
    console.log(`Execute ${files[i]}`);
    try {
      await run(files[i]);
    } catch (e) {
      console.error(`An error occurs while executing ${files[i]}`, e);
    }
  }
})();
