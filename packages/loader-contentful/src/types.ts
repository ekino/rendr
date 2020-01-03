import { Asset as ContentfulAsset, Entry } from "contentful";
import { RequestCtx } from "@ekino/rendr-core";

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

export interface Asset {
  url: string;
  title: string;
  id: string;
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
