import Link from "next/link";

export default function RendrText({ message, rawHtml, link }) {
  const components = [];
  if (rawHtml) {
    components.push(
      <div key="1" dangerouslySetInnerHTML={{ __html: message }} />
    );
  } else {
    components.push(<div key="2">{message}</div>);
  }

  if (link) {
    components.push(
      <Link key="3" href="/_rendr" as={link.href}>
        <a>{link.href}</a>
      </Link>
    );
  }

  return components;
}
