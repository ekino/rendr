module.exports = async function(migration) {
  const page = migration.editContentType("rendr_page");
  page.changeFieldControl("blocks", "entryLinksEditor", "builtin", {
    bulkEditing: true
  });

  const article = migration.editContentType("rendr_article");
  article.changeFieldControl("blocks", "entryLinksEditor", "builtin", {
    bulkEditing: true
  });
};
