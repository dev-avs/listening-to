interface Props {
  progressMs: number;
  durationMs: number;
}

export function ProgressBar({ progressMs, durationMs }: Props) {
  const pct = durationMs > 0
    ? Math.min((progressMs / durationMs) * 100, 100)
    : 0;
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
