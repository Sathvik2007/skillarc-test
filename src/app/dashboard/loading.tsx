export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-border bg-card/70"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card/70" />
    </div>
  )
}
