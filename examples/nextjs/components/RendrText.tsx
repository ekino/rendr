import Link from "next/link";

export default function RendrText({
  contents,
  rawHtml,
  link,
}: {
  contents: string;
  rawHtml: string;
  link: { href: string };
}) {
  const components = [];
  if (rawHtml) {
    components.push(
      <div key="1" dangerouslySetInnerHTML={{ __html: contents }} />
    );
  } else {
    components.push(<div key="2">{contents}</div>);
  }

  if (link) {
    components.push(
      <Link key="3" href="/_rendr" as={link.href}>
        <a>{link.href}</a>
      </Link>
    );
  }

  return <>{components}</>;
}
