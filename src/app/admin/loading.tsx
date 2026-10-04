export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label="در حال بارگذاری">
      <div className="h-8 w-48 rounded bg-surface" />
      <div className="h-40 rounded-lg bg-surface" />
    </div>
  );
}
