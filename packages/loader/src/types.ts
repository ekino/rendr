import { Page, RendrCtx, PageType } from "@ekino/rendr-core";
import { AxiosRequestConfig } from "axios";

export type MaybePage = Promise<PageType> | PageType;

export type Loader = (
  ctx: RendrCtx,
  page: PageType,
  next?: (page?: MaybePage) => MaybePage
) => MaybePage;

export type PageBuilder = (ctx: RendrCtx, page: Page) => MaybePage;

export type RouteConfiguration = {
  path: string;
  matcher: (path: string) => {} | undefined;
  pageBuilder: PageBuilder | Loader;
};

export interface InMemorySettings {
  [index: string]: PageBuilder | Loader;
}

export type AxiosOptionsBuilder = (
  url: string,
  options: AxiosRequestConfig
) => { url: string; options: AxiosRequestConfig };
