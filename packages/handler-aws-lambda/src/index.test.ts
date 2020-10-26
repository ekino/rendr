import { readFileSync } from "fs";
import { createContext } from "./index";

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
});
