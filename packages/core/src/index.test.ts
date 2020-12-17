import { createPage, mergePages, Page, createContext } from "./index";

describe("test create page", () => {
  it("empty page", () => {
    const page = createPage({});

    expect(page).toMatchSnapshot();
  });

  it("with head", async () => {
    const page = createPage({
      head: {
        title: "My Custom Title",
        meta: [],
      },
    });

    expect(page).toMatchSnapshot();
  });

  it("with cache", () => {
    const page = createPage({
      cache: {
        ttl: 999,
      },
    });

    expect(page).toMatchSnapshot();
  });

  it("with block definitions", () => {
    const page = createPage({
      blocks: [
        {
          container: "main",
          settings: {
            foo: "bar",
          },
          type: "my.container",
        },
        {
          settings: {
            non: "valid block as missing the type attribute",
          },
        },
        1,
      ],
    });

    expect(page).toMatchSnapshot();
  });
});

describe("test mergePages", () => {
  it("should merge properly", () => {
    const parent = new Page();
    parent.id = "parent";
    parent.cache.ttl = 200;
    parent.head.defaultTitle = "The default title";
    parent.head.meta = [{ name: "foo" }];
    parent.path = "/";
    parent.statusCode = 401;
    parent.template = "3-columns";
    parent.blocks = [
      {
        id: "id-1",
        meta: {},
        container: "header",
        order: 1,
        settings: {},
        type: "type-parent-1",
      },
      {
        id: "id-2",
        meta: {},
        container: "header",
        order: 1,
        settings: {},
        type: "type-parent-2",
      },
    ];

    const page = new Page();
    page.id = "the child page";
    page.head.defaultTitle = "";
    page.head.htmlAttributes = {
      foo: "bar",
    };
    page.head.meta = [{ property: "value" }];
    page.cache.ttl = 100;
    page.path = "/the-child";
    page.statusCode = 403;
    page.template = "2-columns";
    page.blocks = [
      {
        id: "id-1",
        meta: {},
        container: "header",
        order: 1,
        settings: {},
        type: "type-child-1",
      },
      {
        id: "id-2",
        meta: {},
        container: "header",
        order: 1,
        settings: {},
        type: "type-child-2",
      },
    ];

    const p = mergePages([parent, page]);

    expect(p).toMatchSnapshot();
  });

  it("should not generate an error if on entry is not defined", () => {
    const page = new Page();
    page.id = "the child page";
    page.head.defaultTitle = "";
    page.head.htmlAttributes = {
      foo: "bar",
    };
    page.head.meta = [{ property: "value" }];
    page.cache.ttl = 100;
    page.path = "/the-child";
    page.statusCode = 403;
    page.template = "2-columns";
    page.blocks = [
      {
        id: "id-1",
        meta: {},
        container: "header",
        order: 1,
        settings: {},
        type: "type-child-1",
      },
      {
        id: "id-2",
        meta: {},
        container: "header",
        order: 1,
        settings: {},
        type: "type-child-2",
      },
    ];

    const p = mergePages([undefined, null, page]);

    expect(p).toMatchSnapshot();
  });
});

describe("test createContext", () => {
  it("test clientSide context", () => {
    const ctx = createContext("https://ekino.com/foobar?foo=bar");

    expect(ctx.isServerSide).toBeTruthy();
    expect(ctx.isClientSide).toBeFalsy();
    expect(ctx).toMatchSnapshot();
    expect(ctx.req.pathname).toBe("/foobar");

    // try to set a setting
    ctx.settings["foo"] = "bar";

    expect(ctx).toMatchSnapshot();
  });
});
