import { createClient } from "contentful";
import {
  createNormalizer,
  createContentfulLoader
} from "@ekino/rendr-loader-contentful";
import {
  ClientFactory,
  normalizeAuthor,
  normalizeBlockText,
  normalizeBlockFooter,
  normalizeBlockHeader,
  normalizeArticle
} from "@ekino/rendr-loader-contentful";
import { RequestCtx } from "@ekino/rendr-core";

export const defaultContentfulClient: ClientFactory = (ctx: RequestCtx) => {
  // you can use the ctx object to change the client
  // ie: to either use the public API or the preview API.
  return createClient({
    space: process.env.CONTENTFUL_SPACE_ID as string,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
    environment: process.env.CONTENTFUL_ENV || "master"
  });
};

// this function create a normalizer function used to
// clean the contentful data, ie: remove custom information from contentful.
// @ekino/rendr-loader-contentful already have a set of bultin ones.
export const contentfulNormalizer = createNormalizer({
  // those normalizers are used for the demo,
  // so you can remove them and add your own normlizer
  // if you need too.
  rendr_author: normalizeAuthor,
  rendr_article: normalizeArticle,
  rendr_block_text: normalizeBlockText,
  rendr_block_footer: normalizeBlockFooter,
  rendr_block_header: normalizeBlockHeader
});

// create the loader, that will retrieve the Page object from contentful.
export const contentfulLoader = createContentfulLoader(
  defaultContentfulClient,
  contentfulNormalizer
);
