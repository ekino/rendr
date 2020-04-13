module.exports = async function (migration) {
  let article = migration.editContentType("rendr_article");

  article.changeFieldControl("slug", "slugEditor", "builtin", {
    helpText: "The unique public identifier for the article",
  });
};
