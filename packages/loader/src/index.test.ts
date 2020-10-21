import { createChainedLoader, createErrorBoundaryLoader } from "./index";
import { Page, createContext } from "@ekino/rendr-core";
import { Loader } from "./types";

const logger = { log: jest.fn() };
const errorBoundaryLoader = createErrorBoundaryLoader(logger);

let mainPage: Page;
let witnessPage: Page;

const ctx = createContext("/");

const loader1: Loader = (ctx, page, next) => {
  if (!(page instanceof Page)) {
    return next();
  }

  page.blocks.push({
    type: "block1",
    order: 0,
    settings: {},
    container: null,
  });
  return next();
};

const loader2: Loader = (ctx, page, next) => {
  if (!(page instanceof Page)) {
    return next();
  }

  page.blocks.push({
    type: "block2",
    order: 0,
    settings: {},
    container: null,
  });
  return next();
};

const blockingLoader: Loader = (ctx, page, next) => {
  if (!(page instanceof Page)) {
    return next();
  }

  page.head.title = "block execution of the next loaders";
  // console.log("No call to the next function");
};

const exitingLoader: Loader = (ctx, page, next) => {
  // console.log("Return a page object");
  return witnessPage;
};

const referenceChangeLoader: Loader = (ctx, page, next) => {
  // console.log("Pass a new page to the next loader");
  return next(witnessPage);
};

beforeEach(() => {
  mainPage = new Page();
  witnessPage = new Page();
  mainPage.head.title = "main";
  witnessPage.head.title = "witness";
  ctx.isServerSide = true;
  ctx.isClientSide = false;
});

describe("test Chained Loader", () => {
  it("should create a loader from an array of loaders", () => {
    const loader = createChainedLoader([]);
    expect(loader).toBeInstanceOf(Function);
  });
  it("should call successive loaders on the page reference given to it", async () => {
    const loader = createChainedLoader([loader1, loader2]);
    const resultPage = await loader(ctx, mainPage);

    expect(mainPage.head.title).toEqual("main");
    expect(mainPage.blocks.length).toEqual(2);
    expect(mainPage.blocks[0].type).toEqual("block1");
    expect(mainPage.blocks[1].type).toEqual("block2");
    expect(resultPage).toEqual(mainPage);
  });
  it("should stop the chain if one of the loader doesn't call next", async () => {
    const loader = createChainedLoader([loader1, blockingLoader, loader2]);
    const resultPage = await loader(ctx, mainPage);
    expect(mainPage.head.title).toEqual("block execution of the next loaders");
    expect(mainPage.blocks.length).toEqual(1);
    expect(mainPage.blocks[0].type).toEqual("block1");
    expect(resultPage).toBeUndefined();
  });
  it("should stop the chain and return the result of any loader that returns an object", async () => {
    const loader = createChainedLoader([loader1, exitingLoader, loader2]);
    const resultPage = await loader(ctx, mainPage);
    // @ts-ignore
    expect(resultPage.head.title).toEqual("witness");
    // @ts-ignore
    expect(resultPage.blocks.length).toEqual(0);
  });
  it("should change the reference of the page passed to the next loader", async () => {
    const loader = createChainedLoader([
      loader1,
      referenceChangeLoader,
      loader2,
    ]);
    const resultPage = await loader(ctx, mainPage);

    expect(mainPage.head.title).toEqual("main");
    expect(mainPage.blocks.length).toEqual(1);
    expect(mainPage.blocks[0].type).toEqual("block1");

    expect(witnessPage.head.title).toEqual("witness");
    expect(witnessPage.blocks.length).toEqual(1);
    expect(witnessPage.blocks[0].type).toEqual("block2");
    expect(resultPage).toEqual(witnessPage);
  });
});

describe("test errorBoundaryLoader", () => {
  it("should return the page reference given to it if no error", async () => {
    const loader = createChainedLoader([errorBoundaryLoader, loader1]);
    const resultPage = await loader(ctx, mainPage);

    expect(mainPage.head.title).toEqual("main");
    expect(mainPage.blocks.length).toEqual(1);
    expect(mainPage.blocks[0].type).toEqual("block1");
    expect(resultPage).toEqual(mainPage);
  });

  it("should catch errors and return a new page instance", async () => {
    const loader = createChainedLoader([
      errorBoundaryLoader,
      (context, page, next) => {
        throw new Error("An error");
      },
    ]);
    const resultPage = await loader(ctx, mainPage);
    // @ts-ignore
    expect(resultPage.statusCode).toEqual(500);
    // @ts-ignore
    expect(resultPage.settings.message).toEqual("An error");
    expect(resultPage).not.toEqual(mainPage);
  });

  it("should still throw the exception when client side", async () => {
    const loader = createChainedLoader([
      errorBoundaryLoader,
      (context, page, next) => {
        throw new Error("An error");
      },
    ]);
    ctx.isServerSide = false;
    ctx.isClientSide = true;

    let witnessError;
    try {
      const resultPage = await loader(ctx, mainPage);
    } catch (err) {
      witnessError = err;
    }
    // @ts-ignore
    expect(witnessError).toBeInstanceOf(Error);
  });

  it("should not return the stack trace in the page when in production mode", async () => {
    const loader = createChainedLoader([
      errorBoundaryLoader,
      (context, page, next) => {
        throw new Error("An error");
      },
    ]);
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const resultPage = await loader(ctx, mainPage);
    // @ts-ignore
    expect(resultPage.settings.message).toEqual("An error");
    // @ts-ignore
    expect(resultPage.settings.stackTrace).toBeUndefined();
    process.env.NODE_ENV = oldEnv;
  });
});
