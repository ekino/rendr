import React from "react";
import "./RendrTemplate.css";

import { TemplateProps } from "@ekino/rendr-template-react";

export default function RendrTemplate({
  containerRenderer,
  page,
  blocks,
}: TemplateProps) {
  return (
    <div className="container mx-auto">
      <header role="banner">{containerRenderer("header", blocks)}</header>
      <main>{containerRenderer("body", blocks)}</main>
      <footer role="contentinfo">{containerRenderer("footer", blocks)}</footer>
    </div>
  );
}
