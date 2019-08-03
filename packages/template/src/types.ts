import React from "react";
import { BlockDefinition, Settings, Page, RequestCtx } from "@ekino/rendr-core";

export type ReactElement<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;

// -- Template definition
export interface TemplateProps {
  containerRenderer: ContainerRenderer;
  page: Page;
  blocks: BlockDefinition[];
}

export type TemplateRegistry = (code: string) => ReactElement<TemplateProps>;

// -- Block definition
export interface BlockResult {
  component: ReactElement<any>;
  settings: Settings;
}

export type BlockRegistry = (code: string, setting: Settings) => BlockResult;

// -- Rendering helpers
export type ContainerRenderer = (
  area: string,
  blocks: BlockDefinition[]
) => JSX.Element[] | JSX.Element;

export type BlockRenderer = (
  block: BlockDefinition,
  key: string
) => JSX.Element;

export interface ComponentList {
  [index: string]: ReactElement<any>;
}
