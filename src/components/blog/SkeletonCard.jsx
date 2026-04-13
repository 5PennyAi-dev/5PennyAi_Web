export default function SkeletonCard({ featured = false }) {
  if (featured) {
    return (
      <div className="bg-white border border-navy/[0.08] rounded-2xl overflow-hidden mb-8">
        <div className="md:grid md:grid-cols-5">
          {/* Image skeleton */}
          <div className="md:col-span-2 aspect-[16/9] md:aspect-auto md:min-h-[280px] bg-navy/[0.04] animate-pulse" />
          {/* Content skeleton */}
          <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-5 w-16 rounded-full bg-navy/[0.06] animate-pulse" />
              <div className="h-5 w-20 rounded-full bg-navy/[0.06] animate-pulse" />
            </div>
            <div className="h-7 w-3/4 rounded bg-navy/[0.08] animate-pulse" />
            <div className="h-7 w-1/2 rounded bg-navy/[0.08] animate-pulse" />
            <div className="space-y-2 mt-1">
              <div className="h-4 w-full rounded bg-navy/[0.05] animate-pulse" />
              <div className="h-4 w-[90%] rounded bg-navy/[0.05] animate-pulse" />
              <div className="h-4 w-[60%] rounded bg-navy/[0.05] animate-pulse" />
            </div>
            <div className="h-3 w-32 rounded bg-navy/[0.05] animate-pulse mt-4 pt-4 border-t border-navy/[0.06]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-navy/[0.08] rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-[16/9] bg-navy/[0.04] animate-pulse" />
      {/* Content skeleton */}
      <div className="p-6 flex flex-col gap-3">
        <div className="flex gap-1.5">
          <div className="h-5 w-14 rounded-full bg-navy/[0.06] animate-pulse" />
          <div className="h-5 w-18 rounded-full bg-navy/[0.06] animate-pulse" />
        </div>
        <div className="h-5 w-3/4 rounded bg-navy/[0.08] animate-pulse" />
        <div className="h-5 w-1/2 rounded bg-navy/[0.08] animate-pulse" />
        <div className="space-y-2 mt-1">
          <div className="h-4 w-full rounded bg-navy/[0.05] animate-pulse" />
          <div className="h-4 w-[90%] rounded bg-navy/[0.05] animate-pulse" />
        </div>
        <div className="h-3 w-28 rounded bg-navy/[0.05] animate-pulse mt-3 pt-4 border-t border-navy/[0.06]" />
      </div>
    </div>
  )
}
