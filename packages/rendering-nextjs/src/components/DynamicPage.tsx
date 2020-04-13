import React from "react";
import { NextPageContext } from "next";

import { Page, createContext } from "@ekino/rendr-core";
import { Loader } from "@ekino/rendr-loader";
import {
  TemplateRegistry,
  ContainerRenderer,
} from "@ekino/rendr-template-react";

export interface DynamicPageProps {
  page: Page;
}

export function createDynamicPage(
  loader: Loader,
  templateRegistry: TemplateRegistry,
  containerRenderer: ContainerRenderer
) {
  return class DynamicPage extends React.Component<DynamicPageProps> {
    public static async getInitialProps(originalCtx: NextPageContext) {
      // create a new context from the original context
      const ctx = originalCtx.res
        ? createContext(originalCtx.req, originalCtx.res)
        : createContext({ url: originalCtx.asPath });

      // should throw an exception if the loader cannot
      // find the page ...
      const page = await loader(ctx, new Page(), () => null);

      if (ctx.isServerSide && page instanceof Page) {
        ctx.res.statusCode = page.statusCode;
      }

      return {
        page,
        query: ctx.query,
        pathname: ctx.pathname,
        asPath: ctx.asPath,
      };
    }

    public render() {
      const { page } = this.props;

      if (!page) {
        return <div>No page defined</div>;
      }

      const Template = templateRegistry(page.template);

      if (!Template) {
        return <div>Template is not yet defined</div>;
      }

      return (
        <Template
          page={page}
          blocks={page.blocks}
          containerRenderer={containerRenderer}
        />
      );
    }
  };
}
