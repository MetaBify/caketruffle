import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="rounded-[32px] border border-white/70 bg-white/80 p-10 shadow-[var(--shadow)]">
        <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          That page does not exist or the short link was removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-3)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
