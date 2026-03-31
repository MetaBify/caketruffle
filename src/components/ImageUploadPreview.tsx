"use client";

import { useEffect, useState } from "react";

type ImageUploadPreviewProps = {
  className?: string;
};

export default function ImageUploadPreview({
  className,
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    function onChange(event: Event) {
      const target = event.target as HTMLInputElement | null;
      if (!target || target.type !== "file") return;
      if (!target.files || target.files.length === 0) {
        setPreviewUrl(null);
        return;
      }
      const file = target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    window.addEventListener("change", onChange, true);
    return () => {
      window.removeEventListener("change", onChange, true);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div
      className={`mt-2 flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-black/10 bg-[color:var(--surface-2)] text-[color:var(--muted)] ${
        className ?? ""
      }`}
    >
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Preview"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs">No preview yet</span>
      )}
    </div>
  );
}
