type AdSlotProps = {
  label: string;
  className?: string;
};

export default function AdSlot({ label, className }: AdSlotProps) {
  return (
    <div
      className={`flex min-h-[120px] w-full items-center justify-center rounded-lg border border-dashed border-black/15 bg-white/70 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] shadow-sm ${
        className ?? ""
      }`}
    >
      {label}
    </div>
  );
}
