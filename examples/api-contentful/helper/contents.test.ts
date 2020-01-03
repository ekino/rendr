import { loadJson, getMockClient } from "@ekino/rendr-loader-contentful";

import { GetAuthor, GetArticle } from "./contents";

describe("Contents loading from ", () => {
  it("should return an Author", async () => {
    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        expect(query).toEqual({
          content_type: "rendr_author",
          "fields.slug": "thomas-rabaix",
          limit: 2
        });

        return loadJson(`${__dirname}/__fixtures__/contents/authors.json`);
      }
    });

    expect(await GetAuthor(client, "thomas-rabaix")).toMatchSnapshot();
  });

  it("should return an error with Author (duplicate slug)", async () => {
    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        expect(query).toEqual({
          content_type: "rendr_author",
          "fields.slug": "thomas-rabaix",
          limit: 2
        });

        return loadJson(
          `${__dirname}/__fixtures__/contents/duplicate_authors.json`
        );
      }
    });

    try {
      await GetAuthor(client, "thomas-rabaix");
      expect(true).toBeFalsy();
    } catch (err) {
      expect(err).toMatchSnapshot();
    }
  });

  it("should return an article", async () => {
    let call = 0;
    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        call++;

        if (call === 1) {
          expect(query).toEqual({
            content_type: "rendr_website",
            limit: 100,
            skip: 0
          });

          return {
            items: [
              {
                sys: {
                  id: "632kl7enPots4PISSnD6DV"
                },
                fields: {
                  domains: ["ekino.co.uk"]
                }
              }
            ]
          };
        }

        if (call === 2) {
          query["fields.published_at[lte]"] = "fail to mock the date...";

          expect(query).toEqual({
            content_type: "rendr_article",
            "fields.published_at[lte]": "fail to mock the date...",
            "fields.website.sys.id": "632kl7enPots4PISSnD6DV",
            "fields.slug": "headless-cms-challenge",
            limit: 2
          });

          return loadJson(`${__dirname}/__fixtures__/contents/article.json`);
        }
      }
    });

    expect(
      await GetArticle(client, "headless-cms-challenge", {
        domain: "ekino.co.uk"
      })
    ).toMatchSnapshot();
  });
});
