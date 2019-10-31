import React from "react"

export default function RendrText({ title, message }) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  )
}
