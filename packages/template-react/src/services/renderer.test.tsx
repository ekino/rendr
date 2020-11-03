import React from "react";
import renderer from "react-test-renderer";
import { BlockDefinition } from "@ekino/rendr-core";

import { createBlockRenderer } from "./renderer";
import { createBlockRegistry } from "./registries";
import { BlockRendererProps } from "../types";

interface ArticleViewProps {
  blocks: BlockDefinition[];
}

const registry = createBlockRegistry({
  one: (props) => <div>One</div>,
  "article.view": (props: ArticleViewProps & BlockRendererProps) => {
    const { blocks, blockRenderer } = props;
    let id = 0;

    const blockComponents = blocks.map((block) =>
      blockRenderer(block, `key_${id++}`)
    );

    return <div>Two{blockComponents}</div>;
  },
});

const blockRenderer = createBlockRenderer(registry);

describe("Test renderer", () => {
  test("test simple component", () => {
    const block: BlockDefinition = {
      id: "",
      meta: {},
      type: "one",
      settings: {},
      container: "body",
      order: 1,
    };

    const output = blockRenderer(block, "key_1");

    const tree = renderer.create(output).toJSON();

    expect(tree).toMatchSnapshot();
  });

  test("test nested components", () => {
    const block: BlockDefinition = {
      type: "article.view",
      id: "",
      meta: {},
      settings: {
        blocks: [
          {
            type: "one",
            settings: {},
            container: "body",
            order: 1,
          },
          {
            type: "one",
            settings: {},
            container: "body",
            order: 1,
          },
        ],
      },
      container: "body",
      order: 1,
    };

    const output = blockRenderer(block, "key_2");

    const tree = renderer.create(output).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
