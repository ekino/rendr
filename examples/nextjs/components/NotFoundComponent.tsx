export default function NotFoundComponent({ name }: { name: string }) {
  return (
    <div>
      The component cannot be found: <pre>{name}</pre>
    </div>
  );
}
