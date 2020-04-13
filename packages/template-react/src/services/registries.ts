import NotFoundComponent from "../components/NotFoundComponent";
import DefaultTemplate from "../templates/DefaultTemplate";

import { ComponentList, BlockRegistry, TemplateRegistry } from "../types";

export function createBlockRegistry(blocks: ComponentList): BlockRegistry {
  if (!("default" in blocks)) {
    blocks["default"] = NotFoundComponent;
  }

  return (code, settings) => {
    if (code in blocks) {
      return {
        component: blocks[code],
        settings,
      };
    }

    return {
      component: blocks["default"],
      settings: {
        name: code,
        settings,
      },
    };
  };
}

export function createTemplateRegistry(
  templates: ComponentList
): TemplateRegistry {
  if (!("default" in templates)) {
    templates["default"] = DefaultTemplate;
  }

  return (code) => {
    if (code in templates) {
      return templates[code];
    }

    return templates["default"];
  };
}
