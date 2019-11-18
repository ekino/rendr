import React from "react"

import "./default.css"

export default function DefaultTemplate({ containerRenderer, page, blocks }) {
  return (
    <div className="container mx-auto">
      <header role="banner">{containerRenderer("header", blocks)}</header>
      <main>{containerRenderer("body", blocks)}</main>
      <footer role="contentinfo">{containerRenderer("footer", blocks)}</footer>
    </div>
  )
}
