import { Loader } from "./types";
import { Page, createPage, NotFoundError } from "@ekino/rendr-core";

export * from "./types";
export * from "./services/inmemory";
export * from "./services/api";

export const createChainedLoader: (loaders: Loader[]) => Loader = loaders => {
  return async (ctx, page, next) => {
    let i = 0;
    let internalPage = page;

    async function internalNext(nextPage?: Page) {
      if (nextPage instanceof Page) {
        internalPage = nextPage;
      }
      const loader = loaders[i];

      if (!loader) {
        return internalPage;
      }
      i++;

      return await loader(ctx, internalPage, internalNext);
    }

    return await internalNext();
  };
};

// Simple version of a loader that catches errors during the execution of
// following loaders
// Feel free to use your own if you want to manage other error codes
export const errorBoundaryLoader: Loader = async (ctx, page, next) => {
  let resultPage: Page | void;
  try {
    resultPage = await next();
  } catch (err) {
    resultPage = createPage();
    resultPage.statusCode = err instanceof NotFoundError ? 404 : 500;
    resultPage.settings.message = err.message;
  }
  return resultPage;
};
