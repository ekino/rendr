import {
  RendrCtx,
  createPage,
  createContext,
  RedirectPage,
  PageType,
} from "@ekino/rendr-core";

import { MaybePage } from "@ekino/rendr-loader";

import { createApi } from "./index";

describe("test createApi", () => {
  it("with no valid page found by the loader", async () => {
    async function loader(
      ctx: RendrCtx,
      page: PageType,
      next = (page: PageType) => page
    ) {
      return await page;
    }

    const api = createApi(loader);

    const ctx = createContext("http://localhost/");

    // @ts-ignore
    const page = await api(ctx);

    expect(page).toMatchSnapshot();
  });

  it("with valid page found by the loader", async () => {
    async function loader(
      ctx: RendrCtx,
      page: PageType,
      next = (page: PageType) => page
    ) {
      page.statusCode = 200;

      return await next(page);
    }

    const api = createApi(loader);
    const ctx = createContext("http://localhost/");

    const page = await api(ctx);

    expect(page).toMatchSnapshot();
  });

  it("it return the redirection page", async () => {
    async function loader(
      ctx: RendrCtx,
      _page: PageType,
      next = (page: PageType) => page
    ) {
      const page = new RedirectPage();
      page.location = "/redirected-page";
      page.statusCode = 200;

      return await page;
    }

    const api = createApi(loader);
    const ctx = createContext("http://localhost/");

    const page = await api(ctx);

    expect(page).toMatchSnapshot();
  });
});
