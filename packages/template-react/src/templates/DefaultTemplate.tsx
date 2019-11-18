import React from "react";
import { TemplateProps } from "../types";

export default function DefaultTemplate(props: TemplateProps) {
  const { containerRenderer, blocks } = props;

  return (
    <>
      <header>{containerRenderer("header", blocks)}</header>
      <article>{containerRenderer("body", blocks)}</article>
      <footer>{containerRenderer("footer", blocks)}</footer>
    </>
  );
}
