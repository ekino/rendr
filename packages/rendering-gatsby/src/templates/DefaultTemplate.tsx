import React from "react";

import { TemplateProps } from "@ekino/rendr-template-react";

export default function DefaultTemplate(props: TemplateProps) {
  const { containerRenderer, blocks } = props;

  return (
    <>
      <header>{containerRenderer("header", blocks)}</header>
      <nav>{containerRenderer("nav", blocks)}</nav>
      <article>{containerRenderer("article", blocks)}</article>
      <aside>{containerRenderer("aside", blocks)}</aside>
      <footer>{containerRenderer("footer", blocks)}</footer>
    </>
  );
}
