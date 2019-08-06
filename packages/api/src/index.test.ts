import Express from "express";

import { createApi } from "./index";
import { RequestCtx, createPage, Page } from "@ekino/rendr-core";

describe("test createApi", () => {
  it("with no valid page found by the loader", async () => {
    function loader(ctx: RequestCtx) {}

    const api = createApi(loader);
    const req = jest.fn<Express.Request, any[]>();
    const res = jest.fn<Express.Response, any[]>();
    // @ts-ignore
    res.set = jest.fn().mockReturnThis();

    const next = jest.fn<Express.NextFunction, any[]>();

    // @ts-ignore
    const result = await api(req, res, next);

    // @ts-ignore
    expect(res.set).toBeCalledWith(
      "X-Rendr-Content-Type",
      "rendr/octet-stream"
    );
    expect(result).toBeUndefined();
  });

  it("with valid page found by the loader", async () => {
    async function loader(ctx: RequestCtx) {
      return await createPage({});
    }

    const api = createApi(loader);
    const req = jest.fn<Express.Request, any[]>();
    const res = jest.fn<Express.Response, any[]>();
    // @ts-ignore
    res.set = jest.fn().mockReturnThis();
    // @ts-ignore
    res.json = jest.fn().mockReturnThis();

    const next = jest.fn<Express.NextFunction, any[]>();

    // @ts-ignore
    const result = await api(req, res, next);

    // @ts-ignore
    expect(res.set).toBeCalledWith("X-Rendr-Content-Type", "rendr/document");
    // @ts-ignore
    expect(res.json).toBeCalledWith(createPage({}));
  });
});
