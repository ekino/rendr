import { createPage } from "@ekino/rendr-core";
import { IncomingMessage, ServerResponse } from "http";
import axios from "axios";
import { Readable, Writable } from "stream";

import { createApiLoader } from "./api";

jest.mock("axios");

describe("test API Loader", () => {
  it("test rendr/document mode, ie a Page", async () => {
    const loader = createApiLoader("/api");

    const req = jest.fn<IncomingMessage, any[]>();
    // @ts-ignore
    req.headers = {
      accept: "text/html",
      "accept-encoding": "gzip"
    };

    const strPage = JSON.stringify(createPage({}));
    let pos = 0;
    const resp = {
      headers: {
        "x-rendr-content-type": "rendr/document"
      },
      data: new Readable({
        read(size) {
          const content = strPage.substr(pos, size);
          pos = pos + size;

          this.push(content.length ? content : null);
        }
      })
    };
    // @ts-ignore
    axios.get.mockResolvedValue(resp);

    const res = jest.fn<ServerResponse, any[]>();

    const ctx = {
      pathname: "/",
      params: {},
      query: "/",
      asPath: "",
      req: req,
      res: res
    };

    // @ts-ignore
    const result = await loader(ctx);

    expect(result).toMatchSnapshot();
  });

  it("test non rendr/document mode, ie a Binary File", async () => {
    const loader = createApiLoader("/api");

    const req = jest.fn<IncomingMessage, any[]>();
    // @ts-ignore
    req.headers = {
      accept: "text/html",
      "accept-encoding": "gzip"
    };

    const strPage = "the content to be streamed...";
    let pos = 0;
    const resp = {
      headers: {
        "x-rendr-content-type": "rendr/octet-stream"
      },
      data: new Readable({
        read(size) {
          const content = strPage.substr(pos, size);
          pos = pos + size;

          this.push(content.length ? content : null);
        }
      })
    };

    // @ts-ignore
    axios.get.mockResolvedValue(resp);

    let data = "";
    const res = new Writable({
      write(chunk) {
        data += chunk;
      }
    });

    const ctx = {
      pathname: "/",
      params: {},
      query: "/",
      asPath: "",
      req: req,
      res: res
    };

    // @ts-ignore
    const result = await loader(ctx);

    expect(data).toBe(strPage);
  });
});
