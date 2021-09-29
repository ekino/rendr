module.exports = async function (migration) {
  const page = migration.editContentType("rendr_page");

  const zones = [
    "header_blocks",
    "footer_blocks",
    "body_blocks",
    "nav_blocks",
    "aside_blocks",
  ];

  zones.map((v) => {
    page.changeFieldControl(v, "builtin", "entryLinksEditor", {
      bulkEditing: true,
    });
  });
};
