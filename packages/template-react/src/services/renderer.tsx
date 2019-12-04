import React from "react";
import { BlockRegistry, BlockRenderer, ContainerRenderer } from "../types";

export function createBlockRenderer(
  blockRegistry: BlockRegistry
): BlockRenderer {
  return function blockRenderer(block, key) {
    const { component: Component, settings: props } = blockRegistry(
      block.type,
      block.settings
    );

    return <Component key={key} {...props} blockRenderer={blockRenderer} />;
  };
}

export function createContainerRenderer(
  renderBlock: BlockRenderer
): ContainerRenderer {
  return (name, blocks) => {
    return (
      <>
        {blocks
          .filter(block => name === block.container)
          .map((block, i) => {
            return renderBlock(block, `k_${i}`);
          })}
      </>
    );
  };
}
