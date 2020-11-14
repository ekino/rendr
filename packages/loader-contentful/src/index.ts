import { Loader } from "@ekino/rendr-loader";
import {
  mergePages,
  NotFoundError,
  InternalServerError,
  Page,
} from "@ekino/rendr-core";

import {
  EntryNormalizer,
  ClientFactory,
  ContentfulPage,
  Website,
} from "./types";
import { GetWebsite } from "./contents";
import { Entry } from "contentful";
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
    let rawPage: Entry<ContentfulPage>;

    // attach the current site to the Ctx for later use if required
    let queryMainPage = {
      "fields.path": ctx.req.pathname,
      content_type: "rendr_page",
      include: 10,
    };

    const pages = await client.getEntries<ContentfulPage>(queryMainPage);

    if (pages.items.length !== 1) {
      throw new NotFoundError(
        `[Contentful] Unable to get page - path: ${ctx.req.pathname}, hostname: ${ctx.req.hostname}`
      );
    }

    // try to find the website in the matching pages
    for (let p in pages.items) {
      rawPage = pages.items[p];
      const website = pages.items[p].fields.website;

      if (!website || !website.fields.domains) {
        continue;
      }

      if (website.fields.domains.includes(ctx.req.hostname)) {
        site = await normalizer(ctx, website);
        ctx.settings.rendr_site = site;
        
        page = await normalizer(ctx, pages.items[p]);
        break;
      }
    }

    if (!site) {
      throw new InternalServerError(
        `[Contentful] Unable to load the website - domain: ${ctx.req.hostname}`
      );
    }

    if (!rawPage.fields.extends) {
      return page;
    }

    const parentPage = await client.getEntries<ContentfulPage>({
      "fields.code": rawPage.fields.extends,
      limit: 1,
      content_type: "rendr_page",
      include: 10,
      "fields.website.sys.id": site.id,
    });

    if (parentPage.items.length !== 1) {
      throw new InternalServerError(
        `[Contentful] Unable to get parent page - code: ${rawPage.fields.extends}, website.id: ${site.id}`
      );
    }

    return mergePages([await normalizer(ctx, parentPage.items[0]), page]);
  };
}
