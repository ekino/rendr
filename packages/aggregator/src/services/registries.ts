import { HandlerList, HandlerRegistry } from "../types";
import { BlockDefinition } from "@ekino/rendr-core";

export function createHandlerRegistry(handlers: HandlerList): HandlerRegistry {
  return (code: string) => {
    if (code in handlers) {
      return handlers[code];
    }

    return (definition: BlockDefinition): Promise<BlockDefinition> => {
      // if no aggregator found for the block, we just return the block definition as is.
      return Promise.resolve(definition);
    };
  };
}
