import { pipe, pipePageToClient } from "./stream";
import { Readable, Writable } from "stream";
import { Page } from "./types";
import { createPage } from "./index";

function createWritable() {
  const data = {
    chunk: "",
    writable: new Writable(),
  };

  data.writable = new Writable({
    write(chunk, _, callback) {
      data.chunk += chunk;
      callback();
    },
  });

  return data;
}

describe("test create page", () => {
  it("pipe string", async () => {
    // const source = Readable.from("Hello comment ca va ?");
    const dest = createWritable();

    await pipe("Hello comment ca va ?", dest.writable);

    expect(dest.chunk).toBe("Hello comment ca va ?");
  });

  it("pipe Readable", async () => {
    const dest = createWritable();

    await pipe(Readable.from("Hello comment ca va?"), dest.writable);

    expect(dest.chunk).toBe("Hello comment ca va?");
  });

  it("pipePageToClient", async () => {
    const data = JSON.stringify(
      createPage({
        template: "test",
      })
    );

    const page = await pipePageToClient(Readable.from(data));

    expect(page).toBeInstanceOf(Page);
    expect(page.template).toBe("test");
  });
});
