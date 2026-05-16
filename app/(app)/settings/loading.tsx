import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-6 md:py-10 space-y-5">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-16 rounded-2xl" />
    </div>
  )
}
