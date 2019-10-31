import React from "react"

export default function RendrText({ message, rawHtml, link }) {
  const components = []
  if (rawHtml) {
    components.push(
      <div key="1" dangerouslySetInnerHTML={{ __html: message }} />
    )
  } else {
    components.push(<div key="2">{message}</div>)
  }

  if (link) {
    components.push(
      <a key="3" href={link.href}>
        {link.href}
      </a>
    )
  }

  return components
}
