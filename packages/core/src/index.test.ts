import { createPage } from "./index";

describe("test create page", () => {
  it("empty page", () => {
    const page = createPage({});

    expect(page).toMatchSnapshot();
  });

  it("with head", async () => {
    const page = createPage({
      head: {
        title: "My Custom Title",
        meta: []
      }
    });

    expect(page).toMatchSnapshot();
  });

  it("with cache", () => {
    const page = createPage({
      cache: {
        ttl: 999
      }
    });

    expect(page).toMatchSnapshot();
  });

  it("with block definitions", () => {
    const page = createPage({
      blocks: [
        {
          container: "main",
          settings: {
            foo: "bar"
          },
          type: "my.container"
        },
        {
          settings: {
            non: "valid block as missing the type attribute"
          }
        },
        1
      ]
    });

    expect(page).toMatchSnapshot();
  });
});
