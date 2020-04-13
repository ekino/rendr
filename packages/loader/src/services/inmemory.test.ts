import { RequestCtx, Page } from "@ekino/rendr-core";

import { InMemorySettings } from "../types";
import { createInMemoryLoader } from "./inmemory";

function createContext(data: {}): RequestCtx {
  const ctx: RequestCtx = {
    // @ts-ignore
    req: jest.fn(),
    // @ts-ignore
    res: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  };

  return {
    ...ctx,
    ...data,
  };
}

const paths: InMemorySettings = {
  "/blog/:id": (ctx: RequestCtx, basePage: Page) => {
    basePage.statusCode = 419;

    // @ts-ignore
    expect(ctx.params.id).toBe("hello-world");

    return Promise.resolve(basePage);
  },
  "/": (_ctx: RequestCtx, basePage: Page) => {
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
      { pathname: "/", exception: false, statusCode: 418 },
      { pathname: "/blog/hello-world", exception: false, statusCode: 419 },
      { pathname: "/not-found", exception: true },
    ];

    const loader = createInMemoryLoader(paths);

    for (const k in checks) {
      const check = checks[k];

      let page: Page;

      try {
        const result = await loader(
          createContext({ pathname: check.pathname }),
          new Page(),
          () => {}
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
