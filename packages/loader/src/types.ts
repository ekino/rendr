import { Page, RequestCtx } from "@ekino/rendr-core";

export type MaybePage = Promise<Page | void> | Page | void;

export type Loader = (
  ctx: RequestCtx,
  page: Page,
  next: (page?: MaybePage) => MaybePage
) => MaybePage;

export type PageBuilder = (ctx: RequestCtx, page: Page) => MaybePage;

export type RouteConfiguration = {
  path: string;
  matcher: (path: string) => {} | undefined;
  pageBuilder: PageBuilder | Loader;
};

export interface InMemorySettings {
  [index: string]: PageBuilder | Loader;
}
