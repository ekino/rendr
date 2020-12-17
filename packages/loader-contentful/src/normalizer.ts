import { Entry } from "contentful";
import {
  Page,
  Map,
  BlockDefinition,
  Settings,
  NormalizationError,
  createPage,
  RendrCtx,
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

  // check for recursive loop, and protect against
  // infinite loop.
  const stack: string[] = [];

  return async function normalizer(
    ctx: RendrCtx,
    entry: Entry<any> | ContentfulAsset,
    normalizerFn?: EntryNormalizer
  ): Promise<any> {
    if (!validEntry(entry)) {
      return;
    }

    if (stack.includes(entry.sys.id)) {
      // recursive call cannot normalize
      return false;
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
      // entry.sys.type == 'Link' if an entity is not resolvable
      // ie: Contentful API returns a `notResolvable` error.
      return;
    }

    stack.push(entry.sys.id);

    try {
      return await normalizers[key](ctx, entry, normalizer);
    } catch (err) {
      // log error
      if (err instanceof NormalizationError) {
        throw err;
      }

      throw new NormalizationError(err);
    } finally {
      stack.pop();
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

export async function normalizePage(
  ctx: RendrCtx,
  entry: Entry<ContentfulPage>,
  normalizer: EntryNormalizer
): Promise<Page> {
  const ttl = ctx.settings.rendr_site
    ? (ctx.settings.rendr_site as Website).cache.ttl
    : 0;
  const sharedTtl = ctx.settings.rendr_site
    ? (ctx.settings.rendr_site as Website).cache.sharedTtl
    : 0;

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
      ttl: entry.fields.ttl ?? ttl,
      sharedTtl: entry.fields.shared_ttl ?? sharedTtl,
    },
  };

  const keys = Object.keys(entry.fields);

  for (let k in keys) {
    const key = keys[k];

    // NAME_blocks convention
    if (key.substr(-7) !== "_blocks") {
      continue;
    }

    // @ts-ignore
    const blocks = entry.fields[key] as Entry<any>[];
    const container = ((word: string) => {
      const words = word.split("_blocks");
      words.pop();

      return words.join();
    })(key);

    if (!blocks) {
      continue;
    }

    for (let index in blocks) {
      const block = blocks[index];

      const def = await normalizer(ctx, block);

      if (!def) {
        continue;
      }

      def.id = block.sys.id;
      def.container = container;
      def.order = index;

      data.blocks.push(def);
    }
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

export function normalizePicture(ctx: RendrCtx, entry: ContentfulAsset): Asset {
  return {
    id: entry.sys.id,
    title: entry.fields.title,
    url: fixHttps(fixImageUrl(entry.fields.file.url)),
  };
}

export function normalizeWebsite(
  ctx: RendrCtx,
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
    cache: {
      sharedTtl: site.fields.shared_ttl ?? 0,
      ttl: site.fields.ttl ?? 0,
    },
    mainMenu: site.fields.main_menu ? site.fields.main_menu : {},
    settings: site.fields.settings ? site.fields.settings : {},
  };
}

export function createBlockDefinition(
  entry: Entry<BaseContentfulBlock>,
  type: string,
  settings: Settings
): BlockDefinition {
  return {
    id: entry.sys.id,
    container: "body", // default value for now
    order: 99, // default value for now
    settings: settings,
    type: type,
    meta: {},
  };
}
