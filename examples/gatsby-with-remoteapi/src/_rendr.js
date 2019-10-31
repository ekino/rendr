import { createPage } from "@ekino/rendr-rendering-gatsby"

import RendrTemplate from "./templates/RendrTemplate"

import RendrText from "./components/RendrText"
import RendrFooter from "./components/RendrFooter"
import RendrHeader from "./components/RendrHeader"
import RendrIntro from "./components/RendrIntro"
import RendrJumbotron from "./components/RendrJumbotron"

// Configure components used on pages. A component is a standard React component.
const components = {
  "rendr.text": RendrText,
  "rendr.footer": RendrFooter,
  "rendr.header": RendrHeader,
  "rendr.intro": RendrIntro,
  "rendr.jumbotron": RendrJumbotron,
}

// Configure the template available for the page. A template is a standard React component.
const templates = {
  rendr: RendrTemplate,
}

// create the main "layout" in charge of rendering a Rendr Page.
export default createPage(components, templates)
