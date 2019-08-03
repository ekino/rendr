import { createPage } from "@ekino/rendr-core";

describe("test create page", () => {
  it("empty page", async () => {
    const page = createPage({});

    expect(page).toMatchSnapshot();
  });
});
