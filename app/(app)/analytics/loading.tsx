import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <Skeleton className="h-7 w-28" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>

      {/* Achievements */}
      <Skeleton className="h-48 rounded-2xl" />

      {/* Chart */}
      <Skeleton className="h-52 rounded-2xl" />
    </div>
  )
}
