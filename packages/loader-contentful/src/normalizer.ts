import { Entry } from "contentful";
import {
  Page,
  Map,
  BlockDefinition,
  Settings,
  NormalizationError,
  createPage,
  RequestCtx,
} from "@ekino/rendr-core";

import {
  Asset,
  Website,
  ContentfulWebsite,
  ContentfulPage,
  ContentfulAsset,
  EntryNormalizerList,
  EntryNormalizer,
  BaseContentfulBlock,
} from "./types";

const ASSET_REGEXP = /(images\.(ctfassets\.net|contentful\.com)([0-9a-zA-Z/\-_]*)\.([a-z]{1,4}))/g;
const ASSET_FORMATS: Map = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
};

export const emptyPicture = {
  enabled: false,
  id: "-",
  title: "No picture",
  url: "",
};

export const defaultNormalizers: EntryNormalizerList = {
  rendr_page: normalizePage,
  rendr_website: normalizeWebsite,
  asset: normalizePicture, // Asset is the default from contentul
};

export function createNormalizer(
  extraNormalizers: EntryNormalizerList = {}
): EntryNormalizer {
  const normalizers: EntryNormalizerList = {
    ...defaultNormalizers,
    ...extraNormalizers,
  };

  return function normalizer(
    ctx: RequestCtx,
    entry: Entry<any> | ContentfulAsset,
    normalizerFn?: EntryNormalizer
  ): any {
    if (!validEntry(entry)) {
      return;
    }

    let key;
    if (entry.sys.type == "Asset") {
      key = "asset";
    } else if (
      entry.sys.type == "Entry" &&
      entry.sys.contentType.sys.id in normalizers
    ) {
      key = entry.sys.contentType.sys.id;
    } else {
      return;
    }

    try {
      return normalizers[key](ctx, entry, normalizer);
    } catch (err) {
      // log error
      throw new NormalizationError(err);
    }
  };
}

export function fixImageUrl(content: string) {
  if (!content) {
    return "";
  }

  return content.replace(ASSET_REGEXP, (replacement, ...params: string[]) => {
    if (params[3] in ASSET_FORMATS) {
      return `images.ctfassets.net${params[2]}.${params[3]}?fm=${
        ASSET_FORMATS[params[3]]
      }`;
    }

    return replacement;
  });
}

export function fixHttps(url: string) {
  if (url.length < 2) {
    return url;
  }

  if (url.substr(0, 2) == "//") {
    return `https:${url}`;
  }

  return url;
}

export function validEntry(
  entity: Entry<any> | ContentfulAsset,
  contentType = ""
) {
  if (!entity) {
    return false;
  }

  if (!("sys" in entity) || !("id" in entity.sys)) {
    return false;
  }

  if (contentType.length === 0) {
    return true;
  }

  return entity.sys.contentType.sys.id === contentType;
}

export function normalizePage(
  ctx: RequestCtx,
  entry: Entry<ContentfulPage>,
  normalizer: EntryNormalizer
): Page {
  const data = {
    id: entry.sys.id,
    head: {
      title: entry.fields.title,
      meta: [] as Settings[],
    },
    path: entry.fields.path ?? "",
    template: entry.fields.layout ?? "default",
    settings: entry.fields.settings,
    blocks: [] as BlockDefinition[],
    cache: {
      ttl: entry.fields.ttl ?? 0,
    },
  };

  if (entry.fields.blocks) {
    data.blocks = entry.fields.blocks.map((block: Entry<any>) => {
      return normalizer(ctx, block);
    });
  }

  if (entry.fields.seo_keywords && entry.fields.seo_keywords.length > 0) {
    data.head.meta.push({
      name: "keywords",
      content: entry.fields.seo_keywords,
    });
  }

  if (entry.fields.seo_description && entry.fields.seo_description.length > 0) {
    data.head.meta.push({
      name: "description",
      content: entry.fields.seo_description,
    });
  }

  return createPage(data);
}

export function normalizePicture(
  ctx: RequestCtx,
  entry: ContentfulAsset
): Asset {
  return {
    id: entry.sys.id,
    title: entry.fields.title,
    url: fixHttps(fixImageUrl(entry.fields.file.url)),
  };
}

export function normalizeWebsite(
  ctx: RequestCtx,
  site: Entry<ContentfulWebsite>,
  normalizers: EntryNormalizer
): Website {
  return {
    id: site.sys.id,
    name: site.fields.name,
    path: site.fields.path,
    domains: site.fields.domains,
    culture: site.fields.culture,
    countryCode: site.fields.country_code,
    order: site.fields.order ? site.fields.order : 99,
    enabled: !!site.fields.enabled,
  };
}

export function createBlockDefinition(
  entry: Entry<BaseContentfulBlock>,
  type: string,
  settings: Settings
): BlockDefinition {
  return {
    container: entry.fields.container,
    order: entry.fields.order >= 0 ? entry.fields.order : 99,
    settings: settings,
    type: type,
  };
}
