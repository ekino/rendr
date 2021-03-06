import React from "react";
import Head from "next/head";

import { TemplateProps } from "@ekino/rendr-template-react";

export default function DefaultTemplate(props: TemplateProps) {
  const { containerRenderer, blocks } = props;

  return (
    <>
      <Head>
        <title>{props.page.head.title}</title>
        {props.page.head.meta.map((settings) => (
          <meta {...settings} />
        ))}
      </Head>

      <header>{containerRenderer("header", blocks)}</header>
      <article>{containerRenderer("body", blocks)}</article>
      <footer>{containerRenderer("footer", blocks)}</footer>
    </>
  );
}
