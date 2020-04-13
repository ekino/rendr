import { ContentfulClientApi } from "contentful";
import { NotFoundError, InternalServerError } from "@ekino/rendr-core";
import { validEntry } from "./normalizer";
import { Entry, EntryCollection } from "contentful";

import { Website, ContentfulWebsite, ContentfulPage } from "./types";

let defaultOptions = {
  status: 1,
  limit: 100,
  page: 1,
};

let defaultArchiveOptions = {
  status: 1,
  limit: 32,
  page: 1,
};

export async function GetWebsites(
  client: ContentfulClientApi,
  options = {}
): Promise<Entry<ContentfulWebsite>[]> {
  const opts = Object.assign({}, defaultOptions, options);

  const query = {
    limit: opts.limit,
    skip: (opts.page - 1) * opts.limit,
    content_type: "rendr_website",
  };

  return (await client.getEntries<ContentfulWebsite>(query)).items
    .filter((item) => validEntry(item))
    .sort((a, b) => {
      return a.fields.order === b.fields.order
        ? 0
        : a.fields.order > b.fields.order
        ? 1
        : -1;
    });
}

export async function GetWebsite(
  client: ContentfulClientApi,
  domain: string,
  options = {}
): Promise<Entry<ContentfulWebsite>> {
  if (domain.length === 0) {
    throw new InternalServerError(
      `[Contentful] No domain specified to load a website`
    );
  }

  const sites = await GetWebsites(client, { ...options });

  const result = sites.find((site) => {
    if (!site.fields.domains) {
      return false;
    }

    // domains is also an array of domain.
    return site.fields.domains.find((name: string) => {
      return name === domain;
    });
  });

  if (!result) {
    throw new NotFoundError(
      `[Contentful] Unable to load the website - domain: ${domain}`
    );
  }

  return result;
}

export async function GetPages(
  client: ContentfulClientApi,
  options = {}
): Promise<EntryCollection<ContentfulPage>> {
  const opts = Object.assign({ domain: "" }, defaultArchiveOptions, options);

  const site = await GetWebsite(client, opts.domain);

  const query: any = {
    limit: opts.limit,
    skip: (opts.page - 1) * opts.limit,
    content_type: "rendr_page",
    "fields.website.sys.id": site.sys.id,
  };

  return await client.getEntries<ContentfulPage>(query);
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
    "fields.website.sys.id": website.id,
  };

  const result = (
    await client.getEntries<ContentfulPage>(query)
  ).items.filter((item) => validEntry(item));

  if (result.length === 0) {
    throw new NotFoundError(
      `[Contentful] Unable to load the page - path: ${path}, website.id: ${website.id}`
    );
  }

  return result[0];
}
