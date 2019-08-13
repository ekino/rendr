import { Loader } from "@ekino/rendr-loader";
import { RequestCtx, mergePages } from "@ekino/rendr-core";

import {
  EntryNormalizer,
  ClientFinder,
  ContentfulPage,
  Website
} from "./types";
import { GetWebsite } from "./contents";
export { createNormalizer } from "./normalizer";

export function createContentfulLoader(
  clientFinder: ClientFinder,
  normalizer: EntryNormalizer
): Loader {
  return async function(ctx: RequestCtx) {
    // create the query
    const client = clientFinder(ctx);

    // find the related site
    let site: Website;

    try {
      site = normalizer(await GetWebsite(client, ctx.hostname));
    } catch (err) {
      console.debug("Unable to load the website from contentful", {
        hostname: ctx.hostname,
        err: err
      });
      return;
    }

    let queryMainPage = {
      "fields.path": ctx.pathname,
      limit: 1,
      content_type: "rendr_page",
      include: 10,
      "fields.website.sys.id[in]": site.id
    };

    const pages = await client.getEntries<ContentfulPage>(queryMainPage);

    // logger.debug('Looking for page on contentful', { path: filePath, method: 'LoaderContentful', query});
    if (pages.items.length !== 1) {
      // logger.debug('NotFoundError if', { path: filePath, method: 'LoaderContentful', query});
      return; // nothing to return
    }

    if (!pages.items[0].fields.extends) {
      return normalizer(pages.items[0]);
    }

    // logger.debug('Looking for a parent page on contentful', { path: filePath, method: 'LoaderContentful', query});
    const parentPage = await client.getEntries<ContentfulPage>({
      "fields.code": pages.items[0].fields.extends,
      limit: 1,
      content_type: "rendr_page",
      include: 10,
      "fields.website.sys.id[in]": site.id
    });

    if (parentPage.items.length !== 1) {
      return; // nothing to return
    }

    return mergePages([
      normalizer(parentPage.items[0]),
      normalizer(pages.items[0])
    ]);
  };
}
