import {
  createPage,
  createContext,
  Page,
  ResponsePage,
  pipe,
  pipePageToClient,
} from "@ekino/rendr-core";
import axios from "axios";
import { Readable, Writable } from "stream";

import { createApiLoader } from "./api";

jest.mock("axios");

describe("test API Loader", () => {
  it("test rendr/document mode, ie a Page", async () => {
    const loader = createApiLoader("/api");

    const rawData = JSON.stringify(createPage({}));
    let largeData = "[";
    for (let i = 0; i < 128; i++) {
      largeData += rawData + ",";
    }
    largeData += "{}]";

    let pos = 0;
    let cptCall = 0;
    const resp = {
      headers: {
        "x-rendr-content-type": "rendr/document",
        "content-type": "application/json",
      },
      data: new Readable({
        read(size) {
          const content = largeData.substr(pos, size);
          pos = pos + size;
          cptCall++;
          this.push(content.length ? content : null);
        },
      }),
    };
    // @ts-ignore
    axios.get.mockResolvedValue(resp);

    const ctx = createContext("http://localhost");

    // @ts-ignore
    const page = await loader(ctx, new Page(), (page) => page);
    expect(page).toBeInstanceOf(Page);
    expect(page).toMatchSnapshot();
    expect(cptCall).toBe(3);
  });

  it("test non rendr/document mode, ie a Binary File", async () => {
    const loader = createApiLoader("/api");

    let strPage = "the content to be streamed...";
    let pos = 0;
    const resp = {
      headers: {
        "x-rendr-content-type": "rendr/octet-stream",
      },
      data: new Readable({
        read(size) {
          const content = strPage.substr(pos, size);
          pos = pos + size;

          this.push(content.length ? content : null);
        },
      }),
    };

    // @ts-ignore
    axios.get.mockResolvedValue(resp);

    let data = "";
    const res = new Writable({
      write(chunk) {
        data += chunk;
      },
    });

    const ctx = createContext("http://localhost/");

    // @ts-ignore
    const page = await loader(ctx, new Page(), (page) => page);
    expect(page).toBeInstanceOf(ResponsePage);

    if (page instanceof ResponsePage) {
      await pipe(page.body, res);
    }

    expect(data).toBe(strPage);
  });
});
