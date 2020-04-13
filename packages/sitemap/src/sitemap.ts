import {
  PageReference,
  StreamCreator,
  PageReferenceGenerator,
  transformGenerator,
  pipeIteratorToWritable,
} from "@ekino/rendr-core";
import { PageBuilder } from "@ekino/rendr-loader";

import { Writable } from "stream";
import Express from "express";

import { Options } from "./types";
import { ServerResponse } from "http";

export async function sendSitemap(
  res: ServerResponse,
  generator: PageReferenceGenerator
) {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("X-Rendr-Content-Type", "render/sitemap");

  const iter = transformGenerator(generator(), toSitemapEntry);

  const sitemapWritable = createSitemapWritable((name: string) => res, {
    basePathIndex: "",
  });

  await pipeIteratorToWritable(iter, sitemapWritable);
}

export function createSitemapPageBuilder(
  generator: PageReferenceGenerator
): PageBuilder {
  return async (ctx, page) => {
    // we don't care about the page, we just return binary to the output content
    await sendSitemap(ctx.res, generator);
  };
}

/**
 * This function can be used to expose on sitemap with less than 50K items.
 *
 * If you have a bigger website, creating a sitemap index is suitable, but this cannot
 * be done on the fly.
 *
 * @param generator
 */
export function createSitemapRequestHandler(
  generator: PageReferenceGenerator
): Express.RequestHandler {
  return async (req, res, next) => {
    await sendSitemap(res, generator);
  };
}

/**
 * This function is used as a proxy to open or close file as the
 * sitemap has hard contraints on the size or the number of element
 * in the sitemap.xml file.
 *
 * see https://www.sitemaps.org/protocol.html for mor information.
 *
 * @param createStream
 */
export function createSitemapWritable(
  createStream: StreamCreator,
  options: Options
): Writable {
  const MAX_ENTRY_SITEMAP = 50000;
  const MAX_SIZE_MB = 52428800 - 64;
  const useIndex = options.basePathIndex.length > 0;

  let count = 0;
  let size = 0;
  let index = 1;

  let streamMap = openSitemapStream(createStream, `sitemap_${index}`);
  let streamIndex: Writable;

  if (useIndex) {
    streamIndex = openSitemapIndexStream(createStream);
    streamIndex.write(toSitemapIndexEntry(options, `sitemap_${index}`));
  }

  const w = new Writable({
    write(chunk, encoding, callback) {
      // only apply sitemap specifications if index is on. This feature
      // is usefull for large website (ie, number of page > 50000).
      if (useIndex) {
        count++;
        size += chunk.length;

        if (size > MAX_SIZE_MB || count > MAX_ENTRY_SITEMAP) {
          count = size = 0;
          index++;

          closeSitemapStream(streamMap);
          streamMap = openSitemapStream(createStream, `sitemap_${index}`);
          streamIndex.write(toSitemapIndexEntry(options, `sitemap_${index}`));
        }
      }

      streamMap.write(chunk, encoding);
      callback();
    },
  });

  w.on("finish", () => {
    closeSitemapStream(streamMap);

    if (useIndex) {
      closeSitemapIndexStream(streamIndex);
    }
  });

  return w;
}

/**
 * Tranform an PageReference into a url object used in a sitemap
 *
 * @param ref PageReference
 */
export function toSitemapEntry(ref: PageReference): string {
  if (!ref.settings.lastmod) {
    return "";
  }

  let lastmod = ref.settings.lastmod;

  if (lastmod instanceof Date) {
    lastmod = lastmod.toISOString();
  }

  const settings = {
    lastmod,
    changefreq: ref.settings.changefreq ? ref.settings.changefreq : "weekly",
    priority: ref.settings.priority ? ref.settings.priority : "0.8",
  };

  return `<url><loc>${ref.url}</loc><lastmod>${settings.lastmod}</lastmod><priority>${settings.priority}</priority></url>`;
}

export function toSitemapIndexEntry(options: Options, name: string) {
  return `<sitemap><loc>${
    options.basePathIndex
  }/${name}.xml</loc><lastmod>${new Date().toString()}</lastmod></sitemap>`;
}

function openSitemapStream(
  createStream: StreamCreator,
  name: string
): Writable {
  const stream = createStream(`${name}.xml`);

  stream.write(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
  );

  return stream;
}

function closeSitemapStream(stream: Writable) {
  stream.write("</urlset>");
  stream.end();
}

function openSitemapIndexStream(createStream: StreamCreator): Writable {
  const stream = createStream("sitemap.xml");

  stream.write(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
  );

  return stream;
}

function closeSitemapIndexStream(stream: Writable) {
  stream.write("</sitemapindex>");
  stream.end();
}
