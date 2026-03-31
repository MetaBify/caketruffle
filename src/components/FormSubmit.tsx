"use client";

import { useFormStatus } from "react-dom";

type FormSubmitProps = {
  label: string;
};

export default function FormSubmit({ label }: FormSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-2 flex flex-col gap-3">
      {pending ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--surface-2)]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[color:var(--accent)]" />
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--accent-3)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Uploading..." : label}
      </button>
    </div>
  );
}
