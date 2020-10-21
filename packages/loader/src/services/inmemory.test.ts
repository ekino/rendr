import { createContext, Page, RendrCtx } from "@ekino/rendr-core";

import { InMemorySettings } from "../types";
import { createInMemoryLoader } from "./inmemory";

const paths: InMemorySettings = {
  "/blog/:id": (ctx: RendrCtx, basePage: Page) => {
    basePage.statusCode = 419;

    // @ts-ignore
    expect(ctx.req.params.id).toBe("hello-world");

    return Promise.resolve(basePage);
  },
  "/": (_ctx: RendrCtx, basePage: Page) => {
    basePage.statusCode = 418;
    return Promise.resolve(basePage);
  },
};

describe("test inmemory code", () => {
  it("test empty initialize", () => {
    const result = createInMemoryLoader({});

    expect(result).not.toBeNull();
  });

  it("test match", async () => {
    const checks = [
      {
        pathname: "/blog/hello-world?foo=bar",
        exception: false,
        statusCode: 419,
      },
      { pathname: "/", exception: false, statusCode: 418 },
      { pathname: "/not-found", exception: true },
    ];

    const loader = createInMemoryLoader(paths);

    for (const k in checks) {
      const check = checks[k];
      let page: Page;

      try {
        const result = await loader(
          createContext(`http://localhost${check.pathname}`),
          new Page()
        );

        expect(result).not.toBeNull();
        expect(check.exception).toBeFalsy();

        if (result instanceof Page) {
          expect(result.statusCode).toBe(check.statusCode);
        }
      } catch (err) {
        expect(check.exception).toBeTruthy();
      }
    }
  });
});
