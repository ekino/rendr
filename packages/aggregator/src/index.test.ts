import { RendrCtx, Page, createContext } from "@ekino/rendr-core";

import { createAggregatorLoader } from "./index";

function createMockedContext(data: {} = {}): RendrCtx {
  return {
    ...createContext("/"),
    ...data,
  };
}

describe("test inmemory code", () => {
  it("test createAggregator - empty init", async () => {
    const ctx = createMockedContext();
    const aggregator = createAggregatorLoader({});
    const page = new Page();
    await aggregator(ctx, page, (page) => page);

    expect(page).not.toBeNull();
    // @ts-ignore
    expect(page.statusCode).toBe(200);
  });

  it("test createAggregator - with handlers", async () => {
    const ctx = createMockedContext();
    const aggregator = createAggregatorLoader({
      handler: (block) => {
        block.settings.test = "Salut";

        return Promise.resolve(block);
      },
    });

    let page = new Page();

    page.blocks.push({
      id: "",
      meta: {},
      order: 0,
      container: "body",
      type: "handler",
      settings: {},
    });

    await aggregator(ctx, page, (page) => page);

    expect(page).toMatchSnapshot();
  });
});
