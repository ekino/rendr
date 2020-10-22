import { HandlerList } from "./types";
import { Loader } from "@ekino/rendr-loader";
import { Page } from "@ekino/rendr-core";
import { createHandlerRegistry } from "./services/registries";

export function createAggregatorLoader(handlers: HandlerList): Loader {
  const handlerRegistry = createHandlerRegistry(handlers);

  return async (ctx, page, next) => {
    if (!(page instanceof Page)) {
      return next();
    }

    page.blocks = await Promise.all(
      page.blocks.map(async (block) => {
        const handler = handlerRegistry(block.type);

        const result = await handler(block, ctx, page);

        return result;
      })
    );

    return next();
  };
}
