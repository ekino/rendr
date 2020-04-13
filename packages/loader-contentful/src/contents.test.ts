import { loadJson, getMockClient } from "./test";
import { Website } from "./types";
import { GetWebsites, GetWebsite, GetPage } from "./contents";

describe("Contents loading from ", () => {
  it("test order function", () => {
    const values = [2, 2, 3, 1];

    const sorted = values.sort((a, b) => {
      return a === b ? 0 : a > b ? 1 : -1;
    });

    expect(sorted).toEqual([1, 2, 2, 3]);
  });

  it("Should load Websites", async () => {
    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        expect(query).toEqual({
          content_type: "rendr_website",
          limit: 100,
          skip: 0,
        });

        return loadJson(`${__dirname}/__fixtures__/contents/websites.json`);
      },
    });

    expect(await GetWebsites(client)).toMatchSnapshot();
  });

  it("Should return existing website ", async () => {
    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        expect(query).toEqual({
          content_type: "rendr_website",
          limit: 100,
          skip: 0,
        });

        return loadJson(`${__dirname}/__fixtures__/contents/websites.json`);
      },
    });

    expect(await GetWebsite(client, "ekino.com")).toMatchSnapshot();
  });

  it("Should return non existing website ", async () => {
    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        expect(query).toEqual({
          content_type: "rendr_website",
          limit: 100,
          skip: 0,
        });

        return loadJson(`${__dirname}/__fixtures__/contents/websites.json`);
      },
    });

    try {
      await GetWebsite(client, "foobar.com");
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err).toMatchSnapshot();
    }
  });

  it("Should raise an exception as no page will be found", async () => {
    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        expect(query).toEqual({
          "fields.path": "/",
          "fields.website.sys.id": "632kl7enPots4PISSnD6DV",
          limit: 1,
          content_type: "rendr_page",
        });

        return loadJson(
          `${__dirname}/__fixtures__/contents/empty_collection.json`
        );
      },
    });

    const website: Website = {
      id: "632kl7enPots4PISSnD6DV",
      name: "ekino",
      domains: ["ekino.com"],
      path: "/",
      culture: "en_GB",
      countryCode: "GDB",
      order: 0,
      enabled: true,
    };

    try {
      await GetPage(client, website, "/");
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err).toMatchSnapshot();
    }
  });

  it("Should return existing page ", async () => {
    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        expect(query).toEqual({
          "fields.path": "/",
          "fields.website.sys.id": "632kl7enPots4PISSnD6DV",
          limit: 1,
          content_type: "rendr_page",
        });

        return loadJson(`${__dirname}/__fixtures__/contents/pages.json`);
      },
    });

    const website: Website = {
      id: "632kl7enPots4PISSnD6DV",
      name: "ekino",
      domains: ["ekino.com"],
      path: "/",
      culture: "en_GB",
      countryCode: "GDB",
      order: 0,
      enabled: true,
    };

    expect(await GetPage(client, website, "/")).toMatchSnapshot();
  });
});
