async function getOrganizationId(client) {
  const organizations = await client.getOrganizations();
  if (organizations.total > 1) {
    // unable to guess the organisation id, please provide a valid value
    console.log("\n\n");

    organizations.items.forEach((o) => {
      console.log(
        "Please define a CONTENTFUL_ORGANIZATION_ID env value, with one of the following values:"
      );
      console.log(
        ` > ${o.name} => ${o.sys.id} - CONTENTFUL_ORGANIZATION_ID=${o.sys.id}`
      );
    });

    console.log("\n\n");
    throw new Error("Unable to find one organisation");
  }

  return organizations.items[0].sys.id;
}

module.exports = {
  getOrganizationId,
};
