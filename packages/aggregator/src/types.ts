import { BlockDefinition, Page, RendrCtx } from "@ekino/rendr-core";

export type HandlerList = {
  [index: string]: Handler;
};

export type Handler = (
  definition: BlockDefinition,
  ctx: RendrCtx,
  page: Page
) => Promise<BlockDefinition>;

export type HandlerRegistry = (code: string) => Handler;
