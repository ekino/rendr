import React from "react"

export default function RendrText({
  contents,
  rawHtml,
  link,
  title,
  subtitle,
}) {
  return (
    <div className="">
      {title ? <h3 className="text-2xl text-gray-800">{title}</h3> : null}
      <div className="">
        {rawHtml ? (
          <div
            className="remote-markup"
            dangerouslySetInnerHTML={{ __html: contents }}
          />
        ) : (
          <div className="">{contents}</div>
        )}
        {link ? <a href={link.href}>{link.title}</a> : null}
      </div>
    </div>
  )
}
