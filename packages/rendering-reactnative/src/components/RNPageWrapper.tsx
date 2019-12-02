/* eslint-disable import/first */
import React from "react";
import { Page } from "@ekino/rendr-core";
import {
  TemplateRegistry,
  ContainerRenderer
} from "@ekino/rendr-template-react";

export interface RNProps {
  pageContext: {
    page: Page;
  };
}

export function createRNPage(
  templateRegistry: TemplateRegistry,
  containerRenderer: ContainerRenderer
) {
  return class RNPage extends React.Component<RNProps> {
    public render() {
      const { page } = this.props.pageContext;
  
      const Template = templateRegistry(page.template);
  
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
