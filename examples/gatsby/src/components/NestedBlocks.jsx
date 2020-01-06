import React from "react"

export default function NestedBlocks({ blocks, blockRenderer }) {
  return (
    <>
      {blocks.map((block, i) => {
        return blockRenderer(block, `k_${i}`)
      })}
    </>
  )
}
