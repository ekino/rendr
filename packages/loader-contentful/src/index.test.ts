import { RendrCtx, Page } from "@ekino/rendr-core";

import { createContentfulLoader } from "./index";
import { createNormalizer } from "./normalizer";
import { getMockClient, loadJson, createContext } from "./test";

describe("test loader", () => {
  it("page with no extend page", async () => {
    let call = 0;

    const client = getMockClient({
      getEntries: async <T>(query?: any) => {
        call++;

        if (call === 1) {
          expect(query).toEqual({
            content_type: "rendr_website",
            limit: 100,
            skip: 0,
          });

          return loadJson(`${__dirname}/__fixtures__/loader/website.json`);
        }

        if (call === 2) {
          expect(query).toEqual({
            content_type: "rendr_page",
            "fields.path": "/",
            "fields.website.sys.id": "632kl7enPots4PISSnD6DV",
            include: 10,
            limit: 1,
          });

          return loadJson(`${__dirname}/__fixtures__/loader/main_page.json`);
        }

        if (call === 3) {
          expect(query).toEqual({
            content_type: "rendr_page",
            "fields.code": "root",
            "fields.website.sys.id": "632kl7enPots4PISSnD6DV",
            include: 10,
            limit: 1,
          });

          return loadJson(`${__dirname}/__fixtures__/loader/parent_page.json`);
        }
      },
    });

    const normalizer = createNormalizer();

    const clientFinder = (ctx: RendrCtx) => {
      return client;
    };

    const loader = createContentfulLoader(clientFinder, normalizer);

    const ctx = createContext({});

    const page = await loader(ctx, new Page(), (page) => page);

    expect(page).toMatchSnapshot();
  });
});
