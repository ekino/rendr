import React from "react";
import { Page, RequestCtx } from "@ekino/rendr-core";
import { Loader } from "@ekino/rendr-loader";

import { TemplateRegistry, ContainerRenderer } from "../types";

export interface DynamicPageProps {
  page: Page;
}

export function createDynamicPage(
  loader: Loader,
  templateRegistry: TemplateRegistry,
  containerRenderer: ContainerRenderer
) {
  return class DynamicPage extends React.Component<DynamicPageProps> {
    public static async getInitialProps(originalCtx: RequestCtx) {
      // create a new context from the original context
      const ctx = {
        pathname: originalCtx.pathname,
        params: {},
        query: originalCtx.query,
        asPath: originalCtx.req.url,
        req: originalCtx.req,
        res: originalCtx.res
      };

      const page = await loader(ctx);

      // no page returned, the loader failed or take care of the response
      if (!page) {
        return {};
      }

      ctx.res.statusCode = page.statusCode;

      return {
        page,
        params: ctx.params,
        pathname: ctx.pathname,
        query: ctx.query,
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
