import React from "react"

export default function RendrText({ message, rawHtml, link, title }) {
  // if (link) {
  //   components.push(
  //     <a key="3" href={link.href}>
  //       {link.href}
  //     </a>
  //   )
  // }

  return (
    <div className="">
      {title ? <h3 className="text-2xl text-gray-800">{title}</h3> : null}
      <div className="">
        {rawHtml ? (
          <div
            className="remote-markup"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        ) : (
          <div className="">{message}</div>
        )}
      </div>
    </div>
  )
}
