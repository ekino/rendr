import { Entry } from "contentful";

const emptyProfile = {
  enabled: false,
  id: "-",
  title: "No picture",
  url: ""
};

import { BlockDefinition } from "@ekino/rendr-core";

import {
  Author,
  ContentfulAuthor,
  ContentfulArticle,
  Article,
  ContentfulBlockText
} from "./types";

import {
  EntryNormalizer,
  fixImageUrl,
  normalizePicture,
  emptyPicture,
  validEntry,
  createBlockDefinition
} from "@ekino/rendr-loader-contentful";

export function normalizeBlockText(
  entry: Entry<ContentfulBlockText>,
  normalizers: EntryNormalizer
): BlockDefinition {
  return createBlockDefinition(entry, "rendr.text", {
    title: entry.fields.title ? entry.fields.title : "",
    subtitle: entry.fields.subtitle ? entry.fields.subtitle : "",
    contents: entry.fields.contents ? fixImageUrl(entry.fields.contents) : "",
    mode: entry.fields.mode ? entry.fields.mode : "standard",
    image: entry.fields.image ? normalizers(entry.fields.image) : emptyPicture,
    image_position: entry.fields.image_position
      ? entry.fields.image_position
      : "left"
  });
}

export function normalizeBlockHeader(
  entry: Entry<ContentfulBlockText>,
  normalizers: EntryNormalizer
): BlockDefinition {
  return createBlockDefinition(entry, "rendr.header", {});
}

export function normalizeBlockFooter(
  entry: Entry<ContentfulBlockText>,
  normalizers: EntryNormalizer
): BlockDefinition {
  return createBlockDefinition(entry, "rendr.footer", {});
}

export function normalizeAuthor(
  entry: Entry<ContentfulAuthor>,
  normalizers: EntryNormalizer
): Author {
  return {
    id: entry.sys.id,
    name: entry.fields.name,
    jobTitle: entry.fields.job_title,
    slug: entry.fields.slug,
    biography: fixImageUrl(entry.fields.biography),
    social: {
      twitter: entry.fields.social_twitter,
      facebook: entry.fields.social_facebook,
      linkedin: entry.fields.social_linkedin
    },
    image: entry.fields.image
      ? normalizePicture(entry.fields.image)
      : emptyProfile
  };
}

export function normalizeArticle(
  entry: Entry<ContentfulArticle>,
  normalizer: EntryNormalizer
): Article {
  return {
    id: entry.sys.id,
    type: entry.fields.type,
    abstract: entry.fields.abstract ? entry.fields.abstract : "",
    images: {
      list: entry.fields.image_list
        ? normalizer(entry.fields.image_list)
        : emptyPicture,
      header: entry.fields.image_header
        ? normalizer(entry.fields.image_header)
        : emptyPicture
    },
    title: entry.fields.title ? entry.fields.title : "",
    authors: entry.fields.authors
      ? entry.fields.authors
          .filter(entry => validEntry(entry))
          .map(entry => normalizer(entry))
      : [],
    blocks: entry.fields.blocks
      ? entry.fields.blocks
          .filter(entry => validEntry(entry))
          .map(entry => normalizer(entry))
      : [],
    slug: entry.fields.slug ? entry.fields.slug : "",
    seo: {
      description: entry.fields.seo_description,
      keywords: entry.fields.seo_keywords
    },
    published_at: entry.fields.published_at,
    website: entry.fields.website ? normalizer(entry.fields.website) : undefined
  };
}
