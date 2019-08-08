import { Loader } from "@ekino/rendr-loader";

import {
  createBlockRegistry,
  createTemplateRegistry,
  ComponentList,
  createBlockRenderer,
  createContainerRenderer
} from "@ekino/rendr-template-react";

import { createDynamicPage } from "./components/DynamicPage";

export function createPage(
  blocks: ComponentList,
  templates: ComponentList,
  loader: Loader
) {
  const blockRegistry = createBlockRegistry(blocks);
  const templateRegistry = createTemplateRegistry(templates);
  const blockRenderer = createBlockRenderer(blockRegistry);
  const containerRenderer = createContainerRenderer(blockRenderer);

  return createDynamicPage(loader, templateRegistry, containerRenderer);
}
