import { readFileSync } from "fs";
import { createResponsePage } from "@ekino/rendr-core";
import { createContext, send } from "./index";

describe("create context", () => {
  function loadJson(path: string) {
    return JSON.parse(readFileSync(path, { encoding: "utf8" }));
  }

  it("createContext from GET request", async () => {
    const payload = loadJson(`${__dirname}/__fixtures__/payload_get_v2.json`);

    const ctx = createContext(payload.event, {});

    expect(ctx).toMatchSnapshot();
  });

  it("createContext from POST request", async () => {
    const payload = loadJson(`${__dirname}/__fixtures__/payload_post_v2.json`);

    const ctx = createContext(payload.event, {});

    expect(ctx).toMatchSnapshot();
  });

  it("createContext from GET request with empty path", async () => {
    const payload = loadJson(
      `${__dirname}/__fixtures__/payload_get_empty_path_v2.json`
    );

    const ctx = createContext(payload.event, {});

    expect(ctx).toMatchSnapshot();
    expect(ctx.req.pathname).toBe("/");
  });
});


describe("test send ", () => {
  it("return a object from a ResponsePage", async () => {
    const resp = createResponsePage(200, {
      'Content-Type': 'text/plain; encoding=utf-8'
    }, "Hello World");

    const result = await send(resp)

    expect(result).toMatchSnapshot()
    expect(result.body).toBe("Hello World")
  })
})