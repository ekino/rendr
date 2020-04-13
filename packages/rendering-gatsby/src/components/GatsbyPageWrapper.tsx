/* eslint-disable import/first */
import React from "react";
import { Page } from "@ekino/rendr-core";
import {
  TemplateRegistry,
  ContainerRenderer,
} from "@ekino/rendr-template-react";

// more element available on ReplaceComponentRendererArgs
export interface GatsbyProps {
  pageContext: {
    page: Page;
  };
}

export function createGatsbyPage(
  templateRegistry: TemplateRegistry,
  containerRenderer: ContainerRenderer
) {
  return class GatsbyPage extends React.Component<GatsbyProps> {
    public render() {
      if (!(this.props.pageContext instanceof Object)) {
        return (
          <div>
            "pageContext" attribute is missing or not an Object from the
            Gatsby.ReplaceComponentRendererArgs Props
          </div>
        );
      }

      if (!("page" in this.props.pageContext)) {
        return <div>No `page` props defined in the `pageContext`.</div>;
      }

      const { page } = this.props.pageContext;

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
