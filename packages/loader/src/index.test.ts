import { createChainedLoader } from "./index";
import { Page, RequestCtx } from "@ekino/rendr-core";
import { Loader } from "./types";

let mainPage: Page;
let witnessPage: Page;
const ctx: RequestCtx = {
  // @ts-ignore
  req: jest.fn(),
  // @ts-ignore
  res: jest.fn(),
  pathname: "/",
  query: {},
  asPath: "/"
};

const loader1: Loader = (ctx, page, next) => {
  page.blocks.push({
    type: "block1",
    order: 0,
    settings: {},
    container: null
  });
  return next();
};

const loader2: Loader = (ctx, page, next) => {
  page.blocks.push({
    type: "block2",
    order: 0,
    settings: {},
    container: null
  });
  return next();
};

const blockingLoader: Loader = (ctx, page, next) => {
  page.head.title = "block execution of the next loaders";
  console.log("No call to the next function");
};

const exitingLoader: Loader = (ctx, page, next) => {
  console.log("Return a page object");
  return witnessPage;
};

const referenceChangeLoader: Loader = (ctx, page, next) => {
  console.log("Pass a new page to the next loader");
  return next(witnessPage);
};

const resultPageNullifierLoader: Loader = (ctx, page, next) => {
  console.log("Call next but do not return it");
  next();
};

beforeEach(() => {
  mainPage = new Page();
  witnessPage = new Page();
  mainPage.head.title = "main";
  witnessPage.head.title = "witness";
});

describe("test Chained Loader", () => {
  it("should create a loader from an array of loaders", () => {
    const loader = createChainedLoader([]);
    expect(loader).toBeInstanceOf(Function);
  });
  it("should call successive loaders on the page reference given to it", async () => {
    const loader = createChainedLoader([loader1, loader2]);
    const resultPage = await loader(ctx, mainPage, () => {});

    expect(mainPage.head.title).toEqual("main");
    expect(mainPage.blocks.length).toEqual(2);
    expect(mainPage.blocks[0].type).toEqual("block1");
    expect(mainPage.blocks[1].type).toEqual("block2");
    expect(resultPage).toEqual(mainPage);
  });
  it("should stop the chain if one of the loader doesn't call next", async () => {
    const loader = createChainedLoader([loader1, blockingLoader, loader2]);
    const resultPage = await loader(ctx, mainPage, () => {});
    expect(mainPage.head.title).toEqual("block execution of the next loaders");
    expect(mainPage.blocks.length).toEqual(1);
    expect(mainPage.blocks[0].type).toEqual("block1");
    expect(resultPage).toBeUndefined();
  });
  it("should stop the chain and return the result of any loader that returns an object", async () => {
    const loader = createChainedLoader([loader1, exitingLoader, loader2]);
    const resultPage = await loader(ctx, mainPage, () => {});
    // @ts-ignore
    expect(resultPage.head.title).toEqual("witness");
    // @ts-ignore
    expect(resultPage.blocks.length).toEqual(0);
  });
  it("should change the reference of the page passed to the next loader", async () => {
    const loader = createChainedLoader([
      loader1,
      referenceChangeLoader,
      loader2
    ]);
    const resultPage = await loader(ctx, mainPage, () => {});

    expect(mainPage.head.title).toEqual("main");
    expect(mainPage.blocks.length).toEqual(1);
    expect(mainPage.blocks[0].type).toEqual("block1");

    expect(witnessPage.head.title).toEqual("witness");
    expect(witnessPage.blocks.length).toEqual(1);
    expect(witnessPage.blocks[0].type).toEqual("block2");
    expect(resultPage).toEqual(witnessPage);
  });
  it("should change the reference and return undefined", async () => {
    const loader = createChainedLoader([
      resultPageNullifierLoader,
      loader1,
      loader2
    ]);
    const resultPage = await loader(ctx, mainPage, () => {});

    expect(mainPage.head.title).toEqual("main");
    expect(mainPage.blocks.length).toEqual(2);
    expect(mainPage.blocks[0].type).toEqual("block1");
    expect(mainPage.blocks[1].type).toEqual("block2");
    expect(resultPage).toBeUndefined();
  });
});
