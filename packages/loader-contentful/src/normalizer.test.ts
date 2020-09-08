import { fixImageUrl, validEntry } from "./normalizer";
import { createDummyEntry } from "./test";
import { createNormalizer } from "./index";
import { EntryNormalizerList } from "./types";
import { Entry } from "contentful";
import { loadJson, createContext } from "./test";
import { RequestCtx } from "@ekino/rendr-core";

interface Wheel {
  brand: string;
  size: number;
}

interface Car {
  speed: number;
  name: string;
  data: number; // the normalization will update this value
  wheel: Wheel; // the normalization will update this value
}

interface ContentfulWeel {
  info: string;
}

interface ContentfulCar {
  speed: number;
  name: string;
  data: string;
  wheel: Entry<ContentfulWeel>;
}

describe("test fix url", () => {
  it("should fix single url", () => {
    const contents = [
      {
        source:
          "//images.ctfassets.net/95wnqgvmhlea/2IPecD9vXywcucqKWiQu8S/3e6cf50875e99bb6230cd7dc54553206/anne-marte.jpg",
        expected:
          "//images.ctfassets.net/95wnqgvmhlea/2IPecD9vXywcucqKWiQu8S/3e6cf50875e99bb6230cd7dc54553206/anne-marte.jpg?fm=jpg",
      },
      {
        source:
          "//images.ctfassets.net/95wnqgvmhlea/2IPecD9vXywcucqKWiQu8S/3e6cf50875e99bb6230cd7dc54553206/anne-marte.png hello //images.ctfassets.net/95wnqgvmhlea/2IPecD9vXywcucqKWiQu8S/3e6cf50875e99bb6230cd7dc54553206/anne-marte.jpeg",
        expected:
          "//images.ctfassets.net/95wnqgvmhlea/2IPecD9vXywcucqKWiQu8S/3e6cf50875e99bb6230cd7dc54553206/anne-marte.png?fm=png hello //images.ctfassets.net/95wnqgvmhlea/2IPecD9vXywcucqKWiQu8S/3e6cf50875e99bb6230cd7dc54553206/anne-marte.jpeg?fm=jpg",
      },
      {
        source:
          '<a href="//images.contentful.com/95wnqgvmhlea/2lffMyV2ccEuI2cMkqyigs/367f93360c80948ae3e208662724e14a/run.png"><img alt="Figure 3. Screenshot illustrating the way to run a jupyter notebook cell." src="//images.contentful.com/95wnqgvmhlea/2lffMyV2ccEuI2cMkqyigs/367f93360c80948ae3e208662724e14a/run.png"></a>',
        expected:
          '<a href="//images.ctfassets.net/95wnqgvmhlea/2lffMyV2ccEuI2cMkqyigs/367f93360c80948ae3e208662724e14a/run.png?fm=png"><img alt="Figure 3. Screenshot illustrating the way to run a jupyter notebook cell." src="//images.ctfassets.net/95wnqgvmhlea/2lffMyV2ccEuI2cMkqyigs/367f93360c80948ae3e208662724e14a/run.png?fm=png"></a>',
      },
    ];

    contents.forEach((v) => {
      expect(fixImageUrl(v.source)).toEqual(v.expected);
    });
  });
});

describe("test validEntry", () => {
  it("with invalid entry", () => {
    // @ts-ignore
    expect(validEntry(false)).toBeFalsy();

    // @ts-ignore
    expect(validEntry({})).toBeFalsy();
  });

  it("with a valid entry but no contentType", () => {
    const entry = createDummyEntry<any>({});

    expect(validEntry(entry)).toBeTruthy();
  });

  it("with a valid entry but with specific invalid contentType", () => {
    const entry = createDummyEntry<any>({});

    expect(validEntry(entry, "FooBar")).toBeFalsy();
  });

  it("with a valid entry but with specific valid contentType", () => {
    const entry = createDummyEntry<any>({});

    expect(validEntry(entry, "DummyEntry")).toBeTruthy();
  });
});

describe("test normalizer", () => {
  it("with default values (no normalizer)", () => {
    const normalizer = createNormalizer();

    const ctx = createContext({});
    const entry = createDummyEntry<ContentfulCar>({
      speed: 10,
      name: "2CV",
      data: "1",
      wheel: createDummyEntry<ContentfulWeel>({
        info: "",
      }),
    });

    const result = normalizer(ctx, entry);

    expect(result).toBeUndefined();
  });

  it("with default values with normalizer", () => {
    const normalizers: EntryNormalizerList = {
      car: (ctx: RequestCtx, entry: Entry<ContentfulCar>, normalizer) => {
        return {
          speed: entry.fields.speed,
          name: entry.fields.name,
          data: parseInt(entry.fields.data, 10),
          wheel: normalizer(ctx, entry.fields.wheel),
        };
      },
      wheel: (ctx: RequestCtx, entry: Entry<ContentfulWeel>) => {
        const split = entry.fields.info.split(",");

        return {
          brand: split[0],
          size: parseInt(split[1], 10),
        };
      },
    };
    const normalizer = createNormalizer(normalizers);

    const ctx = createContext({});
    const entry = createDummyEntry<ContentfulCar>({
      speed: 10,
      name: "2CV",
      data: "1",
      wheel: createDummyEntry<ContentfulWeel>({
        info: "michelin,17",
      }),
    });
    entry.sys.contentType.sys.id = "car"; // so the normalizer can catch the value
    entry.fields.wheel.sys.contentType.sys.id = "wheel";

    const result = normalizer(ctx, entry);

    expect(result).toMatchSnapshot();
  });

  const files = [
    "rendr_page",
    "rendr_page_missing_field",
    "rendr_website",
    "asset",
  ];

  const ctx = createContext({});

  files.forEach((file) => {
    it(`test ${file}.json`, () => {
      const normalizer = createNormalizer({});
      const entry = loadJson(
        `${__dirname}/__fixtures__/normalizer/${file}.json`
      );
      const block = normalizer(ctx, entry);

      expect(block).toBeDefined();
      expect(block).toMatchSnapshot();
    });
  });
});
