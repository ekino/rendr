import React from "react"

export default function NotFoundComponent({ name }) {
  return (
    <div>
      The component cannot be found: <pre>{name}</pre>
    </div>
  )
}
