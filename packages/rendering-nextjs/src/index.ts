import React from "react";
import { AppContext } from "next/app";
import { NextComponentType, NextPageContext } from "next";

import { Loader } from "@ekino/rendr-loader";

import {
  createBlockRegistry,
  createTemplateRegistry,
  ComponentList,
  createBlockRenderer,
  createContainerRenderer
} from "@ekino/rendr-template-react";

import { createDynamicPage } from "./components/DynamicPage";

export function updateNextData(props: any, defaultPage = "/_rendr") {
  if (
    !props.__NEXT_DATA__.err &&
    props.__NEXT_DATA__.props.pageProps &&
    props.__NEXT_DATA__.props.pageProps.page
  ) {
    props.__NEXT_DATA__.page = "/_rendr";
  }
}

export async function getInitialProps(
  RendrPage: NextComponentType<NextPageContext, any, {}>,
  { Component, ctx }: AppContext
) {
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
      pageProps: {}
    };
  }

  return { pageProps };
}

export function getComponent(
  RendrPage: NextComponentType<NextPageContext, any, {}>,
  props: any
) {
  let { Component, pageProps } = props;

  // once loaded in the javascript, the router will return
  // the original ErrorPage component. So for the browser,
  // we just set back the original Rendr Component.
  if (!pageProps || "page" in pageProps) {
    Component = RendrPage;
  }

  return {
    Component,
    pageProps
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
