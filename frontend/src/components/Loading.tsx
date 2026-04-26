export function Loading() {
  return (
    <div className="grid gap-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/70 shadow-sm" />
      ))}
    </div>
  );
}
