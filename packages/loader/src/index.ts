import { Loader, MaybePage } from "./types";
import {
  Page,
  createPage,
  NotFoundError,
  RendrError,
  RequestCtx
} from "@ekino/rendr-core";

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

function flattenStackTrace(err: Error | RendrError, stack: string[] = []) {
  if (err instanceof RendrError && err.previousError) {
    flattenStackTrace(err.previousError, stack);
  }

  stack.push(err.stack);

  return stack;
}

type Logger = Partial<{
  log: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
  info: (message?: any, ...optionalParams: any[]) => void;
}>;

// Behaviour is as follow:
// 1. Always log the error stack
// 2. If headers were sent, just ends the response
// 3. The resultPage receives the message of the error in the key message of its settings
// 4. In non production mode, resultPage also receives the error trace
// 5. Client side, the error is thrown as normal for browser to catch it
export function generateErrorHandler(logger: Logger) {
  return (err: Error | RendrError, ctx: RequestCtx, page: Page): MaybePage => {
    const fullStack = flattenStackTrace(err);
    fullStack.forEach(stack => logger.log(stack));

    if (ctx.res && ctx.res.headersSent) {
      ctx.res.end();
      return;
    }

    const resultPage = createPage();

    resultPage.statusCode = err instanceof NotFoundError ? 404 : 500;
    resultPage.settings.message = err.message;

    if (ctx.isServerSide && process.env.NODE_ENV !== "production") {
      resultPage.settings.stackTrace = fullStack;
    }

    if (ctx.isClientSide) {
      throw err;
    }

    return resultPage;
  };
}

export function createErrorBoundaryLoader(logger: Logger = console): Loader {
  return async (ctx, page, next) => {
    try {
      return await next();
    } catch (err) {
      const handler = generateErrorHandler(logger);
      return handler(err, ctx, page);
    }
  };
}
