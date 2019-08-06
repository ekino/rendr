import { RequestCtx, Page } from "@ekino/rendr-core";

import { createAggregator } from "./index";

function createContext(data: {} = {}): RequestCtx {
  const ctx: RequestCtx = {
    // @ts-ignore
    req: jest.fn(),
    // @ts-ignore
    res: jest.fn(),
    pathname: "/",
    query: {},
    params: {}
  };

  return {
    ...ctx,
    ...data
  };
}

describe("test inmemory code", () => {
  it("test createAggregator - empty init", async () => {
    const ctx = createContext();
    const aggregator = createAggregator({});

    const page = await aggregator(new Page(), ctx);

    expect(page).not.toBeNull();
    expect(page.statusCode).toBe(200);
  });

  it("test createAggregator - with handlers", async () => {
    const ctx = createContext();
    const aggregator = createAggregator({
      handler: block => {
        block.settings.test = "Salut";

        return Promise.resolve(block);
      }
    });

    let page = new Page();

    page.blocks.push({
      order: 0,
      container: "body",
      type: "handler",
      settings: {}
    });

    page = await aggregator(page, ctx);

    expect(page).toMatchSnapshot();
  });
});
