import {
  createPageReferencesGenerator,
  createPageReference,
  transformGenerator,
  AsyncPageReferenceGenerator,
  StreamCreator,
  pipeIteratorToWritable,
} from "@ekino/rendr-core";

import { toSitemapEntry, createSitemapWritable } from "./sitemap";

import { Writable } from "stream";

async function* generatorLoop(i: number): AsyncPageReferenceGenerator {
  for (let x = 0; x < i; x++) {
    yield createPageReference(`https://localhost/${x}/${"x".repeat(40)}`, {
      lastmod: "2005-01-01",
    });
  }
}

describe("Test sitemaps code", () => {
  test("test toSitemapEntry with date", () => {
    const ref = createPageReference("https://myurl.com/", {
      lastmod: new Date("2019-10-24T14:16:29.329Z"),
    });

    const s = toSitemapEntry(ref);

    expect(s).toMatchSnapshot();
  });

  test("test sitemap with index file", async () => {
    const generator = createPageReferencesGenerator({
      group_1: () => generatorLoop(40000),
      group_2: () => generatorLoop(50000),
    });

    let call = 0;

    const files: string[] = [];
    const iter = transformGenerator(generator(), toSitemapEntry);

    const streamCreator: StreamCreator = (name: string) => {
      files.push(name);

      const stream = new Writable({
        write(chunk, encoding, callback) {
          call++;
          callback();
        },
      });

      return stream;
    };

    const sitemapWritable = createSitemapWritable(streamCreator, {
      basePathIndex: "https://localhost",
    });

    await pipeIteratorToWritable(iter, sitemapWritable);

    expect(files).toMatchSnapshot();
    // 4 is coming from open and close of the sitemap file
    // 4 is coming from open and close of the sitemap index file
    expect(call).toBe(90000 + 4 + 4);
  });

  test("test sitemap with no index file", async () => {
    const generator = createPageReferencesGenerator({
      group_1: () => generatorLoop(10),
      group_2: () => generatorLoop(5),
    });

    let buffer = "";

    const files: string[] = [];
    const iter = transformGenerator(generator(), toSitemapEntry);

    const streamCreator: StreamCreator = (name: string) => {
      files.push(name);

      const stream = new Writable({
        write(chunk, encoding, callback) {
          buffer += chunk;
          callback();
        },
      });

      return stream;
    };

    const sitemapWritable = createSitemapWritable(streamCreator, {
      basePathIndex: "",
    });

    await pipeIteratorToWritable(iter, sitemapWritable);

    expect(files).toMatchSnapshot();
    expect(buffer).toMatchSnapshot();
  });
});
