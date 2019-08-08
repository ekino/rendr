import React from "react";
import { NextPageContext } from "next";

import { Page, createContext } from "@ekino/rendr-core";
import { Loader } from "@ekino/rendr-loader";
import {
  TemplateRegistry,
  ContainerRenderer
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

      let ctx;
      if (originalCtx.res) {
        // server side
        ctx = createContext(originalCtx.req, originalCtx.res);
      } else {
        ctx = createContext({ url: originalCtx.asPath }, null);
      }

      const page = await loader(ctx);

      // no page returned, the loader failed or take care of the response
      if (!page) {
        return {};
      }

      if (ctx.isServerSide) {
        ctx.res.statusCode = page.statusCode;
      }

      return {
        page,
        query: ctx.query,
        pathname: ctx.pathname,
        asPath: ctx.asPath
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
