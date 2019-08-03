import React from "react";

interface NotFoundComponent {
  name: string;
}

export default function NotFoundComponent(props: NotFoundComponent) {
  return (
    <div>
      The component cannot be found: <pre>{props.name}</pre>
    </div>
  );
}
