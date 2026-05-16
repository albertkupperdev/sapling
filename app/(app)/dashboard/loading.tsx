import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-7">
      {/* Greeting */}
      <div className="rounded-2xl bg-primary/5 p-5 space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Mood selector */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      {/* Quick add */}
      <Skeleton className="h-10 w-full rounded-xl" />

      {/* Task list */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
