import React from "react";
import { NextPageContext } from "next";

import { Page } from "@ekino/rendr-core";

/**
 * NextJS method signatures only support Node HTTP Api like.
 * So it safe to use the @ekino/rendr-handler-http.
 */
import { createContext, send } from "@ekino/rendr-handler-http";

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

      ctx.req.body = "";

      if (ctx.isServerSide && !(page instanceof Page)) {
        return await send(nextCtx.res, page);
      }

      if (ctx.isServerSide && page instanceof Page) {
        nextCtx.res.statusCode = page.statusCode;

        if (page.cache.ttl > 0 && page.statusCode == 200) {
          nextCtx.res.setHeader(
            "Cache-Control",
            `public, max-age=${page.cache.ttl}, s-maxage=${page.cache.sharedTtl}`
          );
        } else {
          nextCtx.res.setHeader(
            "Cache-Control",
            "private, max-age=0, no-cache"
          );
        }
      }

      return {
        page,
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
