import { Loader } from "@ekino/rendr-loader";
import {
  mergePages,
  NotFoundError,
  InternalServerError,
} from "@ekino/rendr-core";

import {
  EntryNormalizer,
  ClientFactory,
  ContentfulPage,
  Website,
} from "./types";
import { GetWebsite } from "./contents";
export * from "./normalizer";
export * from "./contents";
export * from "./types";
export * from "./test";

export function createContentfulLoader(
  clientFactory: ClientFactory,
  normalizer: EntryNormalizer
): Loader {
  return async function (ctx, page, next) {
    // create the query
    const client = clientFactory(ctx);

    // find the related site
    let site: Website;

    try {
      site = normalizer(ctx, await GetWebsite(client, ctx.req.hostname));
    } catch (err) {
      throw new InternalServerError(
        `[Contentful] Unable to load the website - domain: ${ctx.req.hostname}`,
        err
      );
    }

    let queryMainPage = {
      "fields.path": ctx.req.pathname,
      limit: 1,
      content_type: "rendr_page",
      include: 10,
      "fields.website.sys.id": site.id,
    };

    const pages = await client.getEntries<ContentfulPage>(queryMainPage);

    if (pages.items.length !== 1) {
      throw new NotFoundError(
        `[Contentful] Unable to get page - path: ${ctx.req.pathname}, website.id: ${site.id}`
      );
    }

    if (!pages.items[0].fields.extends) {
      return normalizer(ctx, pages.items[0]);
    }

    const parentPage = await client.getEntries<ContentfulPage>({
      "fields.code": pages.items[0].fields.extends,
      limit: 1,
      content_type: "rendr_page",
      include: 10,
      "fields.website.sys.id": site.id,
    });

    if (parentPage.items.length !== 1) {
      throw new InternalServerError(
        `[Contentful] Unable to get parent page - code: ${pages.items[0].fields.extends}, website.id: ${site.id}`
      );
    }

    return mergePages([
      normalizer(ctx, parentPage.items[0]),
      normalizer(ctx, pages.items[0]),
    ]);
  };
}
