import { Page, RequestCtx } from "@ekino/rendr-core";

export type Loader<T> = (ctx: RequestCtx) => Promise<T> | void;

export type PageCreator = (basePage: Page, ctx: RequestCtx) => Promise<Page>;

export type RouteConfiguration = {
  path: string;
  matcher: (path: string) => {} | undefined;
  pageCreator: PageCreator;
};

export interface InMemorySettings {
  [index: string]: PageCreator;
}
