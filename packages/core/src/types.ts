import { IncomingMessage, ServerResponse } from "http";
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

// -- NextJs Controller signature
export interface RequestCtx {
  hostname: string; // the hostname requested
  pathname: string; // the path - without the query string
  query: Map; // the query string, parsed
  params: Map; // the params from the routing, ie param from nice url
  asPath: string; // the complete path - pathname + query
  isServerSide: boolean;
  isClientSide: boolean;
  req: IncomingMessage;
  res?: ServerResponse;
  // anything that need to be set during the life time of the request,
  // this data will no be exposed on the end user.
  settings: Settings;
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
