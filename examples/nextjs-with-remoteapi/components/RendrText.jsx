export default function RendrText({ message, rawHtml }) {
  if (rawHtml) {
    return <div dangerouslySetInnerHTML={{ __html: message }} />;
  }

  return <div>{message}</div>;
}
