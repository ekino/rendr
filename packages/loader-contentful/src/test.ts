import { Entry, ContentfulClientApi } from "contentful";
import { readFileSync } from "fs";
import {
  RendrCtx,
  createContext as coreCreateContext,
} from "@ekino/rendr-core";

export function createContext(data: {}): RendrCtx {
  const ctx = coreCreateContext("https://ekino.co.uk/");

  return {
    ...ctx,
    ...data,
  };
}

export function createDummyEntry<T>(data: T): Entry<T> {
  return {
    sys: {
      type: "Entry",
      id: "",
      createdAt: "",
      updatedAt: "",
      locale: "fr_FR",
      contentType: {
        sys: {
          type: "Link",
          linkType: "ContentType",
          id: "DummyEntry",
        },
      },
      space: {
        sys: {
          type: "Link",
          linkType: "Space",
          id: "DummySpace",
        },
      },
    },
    metadata: {
      tags: []
    },
    fields: data,
    toPlainObject: () => ({}),
    update: () => Promise.resolve(this),
  };
}

export function loadJson(path: string) {
  return JSON.parse(readFileSync(path, { encoding: "utf8" }));
}

export function getMockClient(
  methods: Partial<ContentfulClientApi>
): ContentfulClientApi {
  return {
    getAsset: async (id: string, query?: any) => {
      throw new Error("The method should not be called");
    },
    getAssets: async (query?: any) => {
      throw new Error("The method should not be called");
    },
    getContentType: async (id: string) => {
      throw new Error("The method should not be called");
    },
    getContentTypes: async (query?: any) => {
      throw new Error("The method should not be called");
    },
    getEntries: async <T>(query?: any) => {
      throw new Error("The method should not be called");
    },
    getEntry: async <T>(id: string, query?: any) => {
      throw new Error("The method should not be called");
    },
    getSpace: async () => {
      throw new Error("The method should not be called");
    },
    getLocales: async () => {
      throw new Error("The method should not be called");
    },
    parseEntries: async <T>(raw: any) => {
      throw new Error("The method should not be called");
    },
    sync: async (query: any) => {
      throw new Error("The method should not be called");
    },
    getTag: async (id: string) => {
      throw new Error("The method should not be called");
    },
    getTags: async (query?: any) => {
      throw new Error("The method should not be called");
    },
    ...methods,
  };
}
