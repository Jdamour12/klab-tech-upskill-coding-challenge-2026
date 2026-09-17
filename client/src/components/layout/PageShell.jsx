export function PageShell({ children }) {
  return (
    <main className="ml-24 min-h-screen flex-1 px-6 py-8">
      <div className="mx-auto max-w-[1600px]">{children}</div>
    </main>
  );
}
