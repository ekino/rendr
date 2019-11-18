import { createPage } from "@ekino/rendr-rendering-gatsby"

import DefaultTemplate from "./templates/default"

import RendrText from "./components/RendrText"
import RendrFooter from "./components/RendrFooter"
import RendrHeader from "./components/RendrHeader"

// Configure components used on pages. A component is a standard React component.
const components = {
  "rendr.text": RendrText,
  "rendr.footer": RendrFooter,
  "rendr.header": RendrHeader,
}

// Configure the template available for the page. A template is a standard React component.
const templates = {
  rendr: DefaultTemplate,
  default: DefaultTemplate,
}

// create the main "layout" in charge of rendering a Rendr Page.
export default createPage(components, templates)
