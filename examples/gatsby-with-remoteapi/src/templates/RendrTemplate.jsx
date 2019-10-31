import React from "react"

export default function RendrTemplate({ containerRenderer, page, blocks }) {
  return (
    <>
      <header role="banner">{containerRenderer("header", blocks)}</header>
      <main>{containerRenderer("body", blocks)}</main>
      <footer role="contentinfo">{containerRenderer("footer", blocks)}</footer>
    </>
  )
}
