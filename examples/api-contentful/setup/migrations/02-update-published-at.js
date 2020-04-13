module.exports = async function (migration) {
  const page = migration.editContentType("rendr_page");
  page.changeFieldControl("published_at", "datePicker", "builtin", {
    helpText: "The date where the page will be public",
    format: "time",
    ampm: "24",
  });

  let article = migration.editContentType("rendr_article");

  article.changeFieldControl("published_at", "datePicker", "builtin", {
    helpText: "The date where the page will be public",
    format: "time",
    ampm: "24",
  });
};
