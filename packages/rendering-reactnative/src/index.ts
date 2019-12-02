import {
  createBlockRegistry,
  createTemplateRegistry,
  ComponentList,
  createBlockRenderer,
  createContainerRenderer
} from "@ekino/rendr-template-react";

import { createRNPage } from "./components/RNPageWrapper";

export function createPage(blocks: ComponentList, templates: ComponentList) {
  const blockRegistry = createBlockRegistry(blocks);
  const templateRegistry = createTemplateRegistry(templates);
  const blockRenderer = createBlockRenderer(blockRegistry);
  const containerRenderer = createContainerRenderer(blockRenderer);

  return createRNPage(templateRegistry, containerRenderer);
}
