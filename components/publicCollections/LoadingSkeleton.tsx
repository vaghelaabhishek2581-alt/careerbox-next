export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Controls Bar Skeleton */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>

      {/* College Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Image Skeleton */}
            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
            
            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              
              {/* Location */}
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              
              {/* Rating */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Fees */}
              <div className="grid grid-cols-2 gap-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Badges */}
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center gap-2">
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  )
}
