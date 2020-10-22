import React from "react";
import { NextPageContext } from "next";

import { Page, RedirectPage, ResponsePage } from "@ekino/rendr-core";
import { createContext } from "@ekino/rendr-handler-express";

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

      if (ctx.isServerSide && page instanceof Page) {
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
      }

      if (ctx.isServerSide && page instanceof ResponsePage) {
        nextCtx.res.writeHead(page.statusCode, page.headers);
        nextCtx.res.write(page.body);
        nextCtx.res.end();

        return;
      }

      if (ctx.isServerSide && page instanceof RedirectPage) {
        nextCtx.res.writeHead(page.statusCode, {
          Location: page.location,
        });
        nextCtx.res.end();

        return;
      }

      return {
        page,
        rendrCtx: ctx,
        query: nextCtx.query,
        pathname: nextCtx.pathname,
        asPath: nextCtx.asPath,
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
