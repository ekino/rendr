import { Writable } from "stream";

export interface BlockDefinition {
  type: string;
  settings: Settings;
  container: string;
  order: number;
}
export interface Settings {
  [index: string]: any;
}

export interface Map {
  [index: string]: string;
}

export interface Cache {
  ttl: number;
}

export interface Head {
  titleTemplate: string;
  defaultTitle: string;
  title: string;
  links: Settings[];
  htmlAttributes: Settings;
  meta: Settings[];
}

export type PageType = RedirectPage | ResponsePage | Page;
export type Body = string | ReadableStream | NodeJS.ReadableStream;

export class RedirectPage {
  statusCode: number = 200;
  location: string;
}

export class ResponsePage {
  statusCode: number = 200;
  headers: Map;
  body: Body;
}

// -- Page definition
export class Page {
  public statusCode: number = 200;
  public type: string = "document";
  public template: string = "default";
  public cache: Cache = {
    ttl: 0,
  };
  public head: Head = {
    titleTemplate: "%s",
    defaultTitle: "-",
    title: "-",
    links: [],
    htmlAttributes: {},
    meta: [],
  };
  public blocks: BlockDefinition[] = [];
  public settings: Settings = {};
  public id: string = "";
  public path: string = "";
}

export interface RendrCtx {
  isServerSide: boolean;
  isClientSide: boolean;
  settings: Settings;
  req: RendrRequest;
}

export interface RendrRequest {
  hostname: string; // the hostname requested
  headers: Map;
  query: Map; // the query string, parsed
  pathname: string; // the path - without the query string
  params: Map; // the params from the routing, ie param from nice url
  body: Body;
  method: string;
}

export interface RendrResponse {
  headers: Map;
  body: Body;
  statusCode: number;
}

export type Normalizer = (entry: any) => BlockDefinition;

export type NormalizerList = {
  [index: string]: Normalizer;
};

export interface PageReference {
  url: string;
  group: string;
  settings: Settings;
}

export type AsyncPageReferenceGenerator = AsyncGenerator<
  PageReference,
  void,
  void | unknown
>;
export type PageReferenceGenerator = () => AsyncPageReferenceGenerator;

export interface PageReferenceGenerators {
  [index: string]: PageReferenceGenerator;
}

export type TransformGenerator = (
  data: any
) => Promise<string | Buffer> | string | Buffer;
export type StreamCreator = (name: string) => Writable;
