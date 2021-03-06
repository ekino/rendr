import { validEntry } from "./normalizer";
import { createDummyEntry } from "./test";
import { createNormalizer } from "./index";
import { EntryNormalizerList } from "./types";
import { Entry } from "contentful";
import { loadJson, createContext } from "./test";
import { RendrCtx } from "@ekino/rendr-core";

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
  it("with default values (no normalizer)", async () => {
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

    const result = await normalizer(ctx, entry);

    expect(result).toBeUndefined();
  });

  it("with default values with normalizer", async () => {
    const normalizers: EntryNormalizerList = {
      car: async (ctx: RendrCtx, entry: Entry<ContentfulCar>, normalizer) => {
        return {
          speed: entry.fields.speed,
          name: entry.fields.name,
          data: parseInt(entry.fields.data, 10),
          wheel: await normalizer(ctx, entry.fields.wheel),
        };
      },
      wheel: (ctx: RendrCtx, entry: Entry<ContentfulWeel>) => {
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
    entry.sys.id = "01";
    entry.fields.wheel.sys.contentType.sys.id = "wheel";
    entry.fields.wheel.sys.id = "02";

    const result = await normalizer(ctx, entry);

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
    it(`test ${file}.json`, async () => {
      const normalizer = createNormalizer({});
      const entry = loadJson(
        `${__dirname}/__fixtures__/normalizer/${file}.json`
      );
      const block = await normalizer(ctx, entry);

      expect(block).toBeDefined();
      expect(block).toMatchSnapshot();
    });
  });
});
