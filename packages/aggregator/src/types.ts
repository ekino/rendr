import { BlockDefinition, Page, RequestCtx } from "@ekino/rendr-core";

export type HandlerList = {
  [index: string]: Handler;
};

export type Handler = (
  definition: BlockDefinition,
  ctx: RequestCtx,
  page: Page
) => Promise<BlockDefinition>;

export type HandlerRegistry = (code: string) => Handler;
