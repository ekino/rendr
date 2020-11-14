import { Asset as ContentfulAsset, Entry } from "contentful";
import { RendrCtx, Cache } from "@ekino/rendr-core";

export { Asset as ContentfulAsset } from "contentful";

import { ContentfulClientApi } from "contentful";

export interface EntryNormalizer {
  (
    ctx: RendrCtx,
    entry: Entry<any> | ContentfulAsset,
    normalizers?: EntryNormalizer
  ): any | void;
}

export type EntryNormalizerList = {
  [index: string]: EntryNormalizer;
};

export interface ClientFactory {
  (ctx: RendrCtx): ContentfulClientApi;
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
  settings: object;
  mainMenu: object;
  cache: Cache;
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
  settings: object;
  main_menu: object;
  shared_ttl: number;
  ttl: number;
}

export interface ContentfulPage {
  title: string;
  type: string;
  seo_description: string;
  seo_keywords: string;
  extends: string;
  path: string;
  website: Entry<ContentfulWebsite>;
  layout: string;
  shared_ttl: number;
  ttl: number;
  settings: object;
  published_at: string;
  footer_blocks: Entry<any>[];
  body_blocks: Entry<any>[];
  aside_blocks: Entry<any>[];
  header_blocks: Entry<any>[];
  nav_blocks: Entry<any>[];
  code: string;
}

export interface BaseContentfulBlock {
  internal_title: string;
}
