import React from "react";
import { TemplateProps } from "../types";

export default function DefaultTemplate(props: TemplateProps) {
  const { containerRenderer, blocks } = props;

  /*
        It is possible to use the page property to inject header information
        for SEO, for instance with next:

            import Head from 'next/head';

            // ... 

            <Head>
                <title>{props.page.head.title}</title>
                {props.page.head.meta.map((settings) => <meta {...settings} />) }
            </Head>
    */

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
