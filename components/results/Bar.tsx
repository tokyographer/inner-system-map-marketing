export function Bar({ label, value, display, band, color }: { label: string; value: number; display: number; band: string; color: string }) {
  const meta = band ? `${value.toFixed(1)} · ${band}` : value.toFixed(1);
  return (
    <div className="sm:grid sm:grid-cols-[12rem_minmax(0,1fr)_7rem] sm:items-center sm:gap-x-3">
      <div className="flex items-baseline justify-between gap-3 sm:block">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-ink-muted sm:hidden">{meta}</span>
      </div>
      <div className="mt-1 h-2.5 w-full rounded bg-track sm:mt-0" aria-hidden="true">
        <div className="h-2.5 rounded" style={{ width: `${display}%`, backgroundColor: color }} />
      </div>
      <span className="hidden text-right text-xs text-ink-muted sm:block">{meta}</span>
    </div>
  );
}
