export default function GlobalError() {
  return (
    <div className="flex min-h-screen items-center justify-center text-center text-slate-200">
      <div>
        <h2 className="text-2xl font-semibold">Something went wrong.</h2>
        <p className="mt-2 text-sm text-slate-400">Please try again later.</p>
      </div>
    </div>
  );
}
