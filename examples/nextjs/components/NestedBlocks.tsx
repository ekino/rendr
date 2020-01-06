import React from "react";

import Link from "next/link";
import { BlockDefinition } from "@ekino/rendr-core";
import { BlockRenderer } from "@ekino/rendr-template-react";

export default function ArticleList({
  blocks,
  blockRenderer
}: {
  blocks: BlockDefinition[];
  blockRenderer: BlockRenderer;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        return blockRenderer(block, `k_${i}`);
      })}
    </>
  );
}
