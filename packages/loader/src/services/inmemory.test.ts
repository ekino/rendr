import { RequestCtx } from "@ekino/rendr-core";
import { InMemorySettings } from "../types";
import { createInMemoryLoader } from "./inmemory";

function createContext(data: {}): RequestCtx {
  const ctx: RequestCtx = {
    // @ts-ignore
    req: jest.fn(),
    // @ts-ignore
    res: jest.fn(),
    pathname: "/",
    params: {},
    query: "/",
    asPath: ""
  };

  return {
    ...ctx,
    ...data
  };
}

const paths: InMemorySettings = {
  "/blog/:id": (basePage, ctx) => {
    basePage.statusCode = 419;

    // @ts-ignore
    expect(ctx.params.id).toBe("hello-world");

    return Promise.resolve(basePage);
  },
  "/": basePage => {
    basePage.statusCode = 418;
    return Promise.resolve(basePage);
  }
};

describe("test inmemory code", () => {
  it("test empty initialize", () => {
    const result = createInMemoryLoader({});

    expect(result).not.toBeNull();
  });

  it("test match", async () => {
    const checks = [
      { query: "/", statusCode: 418 },
      { query: "/blog/hello-world", statusCode: 419 },
      { query: "/not-found", statusCode: 404 }
    ];

    const loader = createInMemoryLoader(paths);

    for (const k in checks) {
      if (!checks[k]) {
        continue;
      }
      const check = checks[k];
      const page = await loader(createContext({ asPath: check.query }));
      expect(page).not.toBeNull();

      if (page) {
        // avoid error with TS.
        expect(page.statusCode).toBe(check.statusCode);
      }
    }
  });
});
