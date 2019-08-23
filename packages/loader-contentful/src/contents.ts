import { ContentfulClientApi } from "contentful";
import { NotFoundError } from "@ekino/rendr-core";
import { validEntry } from "./normalizer";
import { Entry, EntryCollection } from "contentful";

import {
  Website,
  ContentfulWebsite,
  ContentfulAuthor,
  ContentfulArticle,
  ContentfulPage
} from "./types";

let defaultOptions = {
  status: 1,
  limit: 100,
  page: 1
};

let defaultArchiveOptions = {
  status: 1,
  limit: 32,
  page: 1
};

export async function GetWebsites(
  client: ContentfulClientApi,
  options = {}
): Promise<Entry<ContentfulWebsite>[]> {
  const opts = Object.assign({}, defaultOptions, options);

  const query = {
    limit: opts.limit,
    skip: (opts.page - 1) * opts.limit,
    content_type: "rendr_website"
  };

  return (await client.getEntries<ContentfulWebsite>(query)).items
    .filter(item => validEntry(item))
    .sort((a, b) => {
      return a.fields.order < b.fields.order ? 0 : 1;
    });
}

export async function GetWebsite(
  client: ContentfulClientApi,
  domain: string,
  options = {}
): Promise<Entry<ContentfulWebsite>> {
  const sites = await GetWebsites(client, { ...options });

  const result = sites.find(site => {
    if (!site.fields.domains) {
      return false;
    }

    // domains is also an array of domain.
    return site.fields.domains.find((name: string) => name === domain);
  });

  if (!result) {
    throw NotFoundError;
  }

  return result;
}

export async function GetPage(
  client: ContentfulClientApi,
  website: Website,
  path: string,
  options = {}
): Promise<Entry<ContentfulPage>> {
  const query = {
    limit: 1,
    content_type: "rendr_page",
    "fields.path": path,
    "fields.website": website.id
  };

  const result = (await client.getEntries<ContentfulPage>(query)).items.filter(
    item => validEntry(item)
  );

  if (result.length === 0) {
    throw NotFoundError;
  }

  return result[0];
}

export async function GetArticles(
  client: ContentfulClientApi,
  options = {}
): Promise<EntryCollection<ContentfulArticle>> {
  const opts = Object.assign(
    { domain: "", authors: [] },
    defaultArchiveOptions,
    options
  );

  const query: any = {
    limit: opts.limit,
    skip: (opts.page - 1) * opts.limit,
    content_type: "rendr_page",
    "fields.published_at[lte]": new Date()
  };

  const site = await GetWebsite(client, opts.domain);

  if (!site) {
    throw NotFoundError;
  }

  // query['fields.type'] = 'type' in opts ? opts.type : 'post';

  if (!("order" in query)) {
    query.order = "-fields.published_at";
  }

  // this is not supported by contentful
  if ("authors" in opts && opts.authors.length > 0) {
    query["fields.authors.sys.id[in]"] = opts["authors"].join(",");
  }

  query["fields.sites.sys.id[in]"] = site.sys.id;

  return await client.getEntries<ContentfulArticle>(query);
}

export async function GetArticle(
  client: ContentfulClientApi,
  slug: string,
  options = {}
): Promise<Entry<ContentfulArticle>> {
  const opts = Object.assign({ domain: "" }, defaultOptions, options);

  if (opts.domain.length === 0) {
    throw NotFoundError;
  }

  const site = await GetWebsite(client, opts.domain);

  if (!site) {
    throw NotFoundError;
  }

  const query: any = {
    "fields.slug": slug,
    limit: 2,
    content_type: "rendr_article",
    "fields.published_at[lte]": new Date(),
    "fields.sites.sys.id[in]": site.sys.id
  };

  // query['fields.type'] = 'type' in opts ? opts.type : 'post';

  const result = await client.getEntries<ContentfulArticle>(query);

  if (result.items.length !== 1) {
    throw NotFoundError;
  }

  return result.items[0];
}

export async function GetAuthor(
  client: ContentfulClientApi,
  slug: string,
  options = {}
): Promise<Entry<ContentfulAuthor>> {
  const opts = Object.assign({}, defaultOptions, options);

  const query = {
    "fields.slug": slug,
    limit: 2,
    content_type: "rendr_author"
  };

  const result = await client.getEntries<ContentfulAuthor>(query);

  if (result.items.length !== 1) {
    throw NotFoundError;
  }

  return result.items[0];
}

export async function GetAuthorArticles(
  client: ContentfulClientApi,
  slug: string,
  options = {}
): Promise<EntryCollection<ContentfulArticle>> {
  let opts = Object.assign({}, defaultOptions, options);

  const author = await GetAuthor(client, slug, opts);

  return GetArticles(client, {
    authors: [author.sys.id]
  });
}
