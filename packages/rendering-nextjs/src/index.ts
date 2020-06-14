import React from "react";
import { AppContext } from "next/app";
import { NextComponentType, NextPageContext } from "next";

import { Loader } from "@ekino/rendr-loader";

import {
  createBlockRegistry,
  createTemplateRegistry,
  ComponentList,
  createBlockRenderer,
  createContainerRenderer,
} from "@ekino/rendr-template-react";

import { createDynamicPage } from "./components/DynamicPage";

export function updateNextData(props: any, defaultPage = "/_rendr") {
  console.log(
    "@ekino/rendr-rendering-nextjs:updateNextData is deprecated, and can be removed, see examples."
  );

  if (
    !props.__NEXT_DATA__.err &&
    props.__NEXT_DATA__.props.pageProps &&
    props.__NEXT_DATA__.props.pageProps.page
  ) {
    props.__NEXT_DATA__.page = defaultPage;
  }
}

export async function getInitialProps(
  RendrPage: NextComponentType<NextPageContext, any, {}>,
  { Component, ctx }: AppContext
) {
  console.log(
    "@ekino/rendr-rendering-nextjs:getInitialProps is deprecated, and can be removed, see examples."
  );
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  if (!pageProps) {
    // component does not return anything ...
    pageProps = {};
  }

  // if it does not match a 404 code, return the component.
  if (
    !(
      Component.displayName === "ErrorPage" &&
      "statusCode" in pageProps &&
      // @ts-ignore
      pageProps.statusCode === 404
    )
  ) {
    return { pageProps };
  }

  pageProps = await RendrPage.getInitialProps(ctx);

  if (!pageProps || !("page" in pageProps)) {
    return {
      pageProps: {},
    };
  }

  return { pageProps };
}

export function getComponent(
  RendrPage: NextComponentType<NextPageContext, any, {}>,
  props: any
) {
  console.log(
    "@ekino/rendr-rendering-nextjs:getComponent is deprecated, and can be removed, see examples."
  );

  let { Component, pageProps } = props;

  // once loaded in the javascript, the router will return
  // the original ErrorPage component. So for the browser,
  // we just set back the original Rendr Component.
  if (!pageProps || "page" in pageProps) {
    Component = RendrPage;
  }

  return {
    Component,
    pageProps,
  };
}

export function createPage(
  blocks: ComponentList,
  templates: ComponentList,
  loader: Loader
) {
  const blockRegistry = createBlockRegistry(blocks);
  const templateRegistry = createTemplateRegistry(templates);
  const blockRenderer = createBlockRenderer(blockRegistry);
  const containerRenderer = createContainerRenderer(blockRenderer);

  return createDynamicPage(loader, templateRegistry, containerRenderer);
}
