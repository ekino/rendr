import React from "react";
import { NextPageContext } from "next";

import { Page } from "@ekino/rendr-core";
import { createContext, send } from "@ekino/rendr-handler-express";

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
    public static async getInitialProps(nextCtx: NextPageContext) {
      // create a new context from the original context
      const ctx = createContext(nextCtx.res ? nextCtx.req : nextCtx.asPath);

      // should throw an exception if the loader cannot
      // find the page ...
      const page = await loader(ctx, new Page(), (page) => page);

      if (page instanceof Page) {
        if (ctx.isServerSide) {
          nextCtx.res.statusCode = page.statusCode;

          if (page.cache.ttl > 0 && page.statusCode == 200) {
            nextCtx.res.setHeader(
              "Cache-Control",
              `public, max-age=${page.cache.ttl}, s-maxage=${page.cache.ttl}`
            );
          } else {
            nextCtx.res.setHeader(
              "Cache-Control",
              "private, max-age=0, no-cache"
            );
          }

          // cannot serialize the IncomingMessage object
          ctx.req.body = "";
        }

        return {
          page,
        };
      }

      send(nextCtx.res, page);
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
