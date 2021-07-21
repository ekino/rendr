import { Entry } from "contentful";
import {
  EntryNormalizer,
  normalizePicture,
  emptyPicture,
  validEntry,
  createBlockDefinition,
} from "@ekino/rendr-loader-contentful";

import {
  BlockDefinition,
  normalizeBlockDefinition,
  RendrCtx,
} from "@ekino/rendr-core";

import {
  Author,
  ContentfulAuthor,
  ContentfulArticle,
  Article,
  ContentfulBlockText,
  ContentfulBlockRawConfiguration,
} from "./types";

const emptyProfile = {
  enabled: false,
  id: "-",
  title: "No picture",
  url: "",
};

export async function normalizeBlockText(
  ctx: RendrCtx,
  entry: Entry<ContentfulBlockText>,
  normalizers: EntryNormalizer
): Promise<BlockDefinition> {
  return createBlockDefinition(entry, "rendr.text", {
    title: entry.fields.title ? entry.fields.title : "",
    subtitle: entry.fields.subtitle ? entry.fields.subtitle : "",
    contents: entry.fields.contents ? entry.fields.contents : "",
    mode: entry.fields.mode ? entry.fields.mode : "standard",
    image: entry.fields.image
      ? await normalizers(ctx, entry.fields.image)
      : emptyPicture,
    image_position: entry.fields.image_position
      ? entry.fields.image_position
      : "left",
  });
}

export function normalizeBlockRawConfiguration(
  ctx: RendrCtx,
  entry: Entry<ContentfulBlockRawConfiguration>,
  normalizers: EntryNormalizer
): BlockDefinition {
  const block = normalizeBlockDefinition(entry.fields.configuration);

  if (!block) {
    // ?
    return;
  }

  return block;
}

export function normalizeBlockHeader(
  ctx: RendrCtx,
  entry: Entry<ContentfulBlockText>,
  normalizers: EntryNormalizer
): BlockDefinition {
  return createBlockDefinition(entry, "rendr.header", {});
}

export function normalizeBlockFooter(
  ctx: RendrCtx,
  entry: Entry<ContentfulBlockText>,
  normalizers: EntryNormalizer
): BlockDefinition {
  return createBlockDefinition(entry, "rendr.footer", {});
}

export function normalizeAuthor(
  ctx: RendrCtx,
  entry: Entry<ContentfulAuthor>,
  normalizers: EntryNormalizer
): Author {
  return {
    id: entry.sys.id,
    name: entry.fields.name,
    jobTitle: entry.fields.job_title,
    slug: entry.fields.slug,
    biography: entry.fields.biography,
    social: {
      twitter: entry.fields.social_twitter,
      facebook: entry.fields.social_facebook,
      linkedin: entry.fields.social_linkedin,
    },
    image: entry.fields.image
      ? normalizePicture(ctx, entry.fields.image)
      : emptyProfile,
  };
}

export async function normalizeArticle(
  ctx: RendrCtx,
  entry: Entry<ContentfulArticle>,
  normalizer: EntryNormalizer
): Promise<Article> {
  let authors = [];
  if (entry.fields.authors) {
    const entries = entry.fields.authors.filter((entry) => validEntry(entry));
    for (let a in entries) {
      authors.push(await normalizer(ctx, entries[a]));
    }
  }

  let blocks = [];
  if (entry.fields.blocks) {
    const entries = entry.fields.blocks.filter((entry) => validEntry(entry));
    for (let a in entries) {
      blocks.push(await normalizer(ctx, entries[a]));
    }
  }

  return {
    id: entry.sys.id,
    type: entry.fields.type,
    abstract: entry.fields.abstract ? entry.fields.abstract : "",
    images: {
      list: entry.fields.image_list
        ? await normalizer(ctx, entry.fields.image_list)
        : emptyPicture,
      header: entry.fields.image_header
        ? await normalizer(ctx, entry.fields.image_header)
        : emptyPicture,
    },
    title: entry.fields.title ? entry.fields.title : "",
    authors,
    blocks,
    slug: entry.fields.slug ? entry.fields.slug : "",
    seo: {
      description: entry.fields.seo_description,
      keywords: entry.fields.seo_keywords,
    },
    published_at: entry.fields.published_at,
    website: entry.fields.website
      ? await normalizer(ctx, entry.fields.website)
      : undefined,
  };
}
