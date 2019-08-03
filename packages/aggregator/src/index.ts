import { PageAggregator, HandlerList, HandlerRegistry } from "./types";
import { Page, RequestCtx } from "@ekino/rendr-core";
import { createHandlerRegistry } from "./services/registries";

export function createAggregator(handlers: HandlerList): PageAggregator {
  const handlerRegistry = createHandlerRegistry(handlers);

  return async (page: Page, ctx: RequestCtx) => {
    page.blocks = await Promise.all(
      page.blocks.map(async block => {
        const handler = handlerRegistry(block.type);

        const result = await handler(block, ctx);

        return result;
      })
    );

    return page;
  };
}
