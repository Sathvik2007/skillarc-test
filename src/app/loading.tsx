export default function AppLoading() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border border-border bg-card/70"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
