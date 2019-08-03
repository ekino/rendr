import { Loader } from "@ekino/rendr-loader";

import { ComponentList } from "./types";
import {
  createBlockRegistry,
  createTemplateRegistry
} from "./services/registries";
import {
  createBlockRenderer,
  createContainerRenderer
} from "./services/renderer";
import { createDynamicPage } from "./components/DynamicPage";

export * from "./types";

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
