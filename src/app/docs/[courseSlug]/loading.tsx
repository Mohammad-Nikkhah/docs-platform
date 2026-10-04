export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4" role="status" aria-label="در حال بارگذاری">
      <div className="h-4 w-48 rounded bg-surface" />
      <div className="h-9 w-2/3 rounded bg-surface" />
      <div className="h-4 w-1/2 rounded bg-surface" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-surface" style={{ width: `${95 - (i % 3) * 12}%` }} />
        ))}
      </div>
    </div>
  );
}
