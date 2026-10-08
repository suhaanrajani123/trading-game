export default function ServerError({ message }: { message: string }) {
  return (
    <div className="panel p-8 max-w-xl">
      <h1 className="text-2xl font-semibold">Can&apos;t load your account</h1>
      <p className="mt-2 text-inksoft">{message}</p>
      <p className="mt-4 text-sm text-muted">
        Running locally? Start the backend with <code className="px-1.5 py-0.5 rounded bg-surface2">uvicorn main:app --reload</code> and refresh.
      </p>
    </div>
  );
}
