import {
  Asset as ContentfulAsset,
  Entry,
  ContentfulCollection
} from "contentful";
import { RequestCtx, BlockDefinition } from "@ekino/rendr-core";

export { Asset as ContentfulAsset } from "contentful";

import { ContentfulClientApi } from "contentful";

export interface EntryNormalizer {
  (entry: Entry<any> | ContentfulAsset, normalizers?: EntryNormalizer):
    | any
    | void;
}

export type EntryNormalizerList = {
  [index: string]: EntryNormalizer;
};

export interface ClientFactory {
  (ctx: RequestCtx): ContentfulClientApi;
}

export interface Website {
  id: string;
  name: string;
  domains: string[];
  path: string;
  culture: string;
  countryCode: string;
  order: number;
  enabled: boolean;
}

export interface Author {
  id: string;
  name: string;
  jobTitle: string;
  slug: string;
  social: {
    twitter: string;
    facebook: string;
    linkedin: string;
  };
  biography: string;
  image: Asset;
}

export interface Asset {
  url: string;
  title: string;
  id: string;
}

export interface Article {
  id: string;
  type: string;
  title: string;
  abstract: string;
  seo: {
    description: string;
    keywords: string;
  };
  slug: string;
  website: Website;
  published_at: string;
  authors: Author[];
  blocks: BlockDefinition[];
  images: {
    list: Asset;
    header: Asset;
  };
}

export interface ContentfulWebsite {
  name: string;
  domains: string[];
  path: string;
  culture: string;
  country_code: string;
  order: number;
  enabled: boolean;
}

export interface ContentfulAuthor {
  name: string;
  job_title: string;
  slug: string;
  social_twitter: string;
  social_facebook: string;
  social_linkedin: string;
  biography: string;
  image: ContentfulAsset;
}

export interface ContentfulPage {
  title: string;
  type: string;
  seo_description: string;
  seo_keywords: string;
  extends: string;
  path: string;
  website: ContentfulWebsite;
  layout: string;
  ttl: number;
  settings: object;
  published_at: string;
  blocks: Entry<any>[];
  code: string;
}

export interface BaseContentfulBlock {
  internal_title: string;
  container: string;
  order: number;
}

export interface ContentfulBlockText extends BaseContentfulBlock {
  title: string;
  subtitle: string;
  contents: string;
  mode: string;
  image: ContentfulAsset;
  image_position: string;
}

export interface ContentfulArticle {
  type: string;
  title: string;
  abstract: string;
  seo_description: string;
  seo_keywords: string;
  slug: string;
  website: Entry<ContentfulWebsite>;
  published_at: string;
  authors: Entry<ContentfulAuthor>[];
  blocks: Entry<any>[];
  image_list: ContentfulAsset;
  image_header: ContentfulAsset;
}
