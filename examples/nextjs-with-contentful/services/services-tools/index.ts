import {
  createPage,
  mergePages,
  RequestCtx,
  Page,
  NotFoundError
} from "@ekino/rendr-core";
import { contentfulLoader } from "../contentful-tools";

/**
 * We create this small helper functions just to avoid code duplication
 * but allow you to customize it depends on your needs.
 */
export async function getPage(page: Page, ctx: RequestCtx) {
  // retrieve the page from the loader,
  // as a side note this code work with any loaders, not only contentful ...
  // as long as the loader return a Page object.
  const pageFromContentful = await contentfulLoader(ctx, page, () => {});

  // Now we have the page, you can either return the page coming from contentful
  // return pageFromContentful

  // or merge it with the default one provided by the code
  return mergePages([page, pageFromContentful as Page]);
}
