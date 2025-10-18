interface LoadingSkeletonProps {
  type?: 'institutes' | 'programs' | 'courses'
  count?: number
}

export function LoadingSkeleton({ type = 'institutes', count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} type={type} />
        ))}
      </div>
    </div>
  )
}

function SkeletonCard({ type }: { type: 'institutes' | 'programs' | 'courses' }) {
  const borderColor = type === 'institutes' ? 'border-l-blue-500' : type === 'programs' ? 'border-l-purple-500' : 'border-l-green-500'
  
  return (
    <div className={`bg-white rounded-lg border-l-4 ${borderColor} shadow-md overflow-hidden animate-pulse`}>
      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-4">
          {/* Logo/Icon Skeleton */}
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
          
          <div className="flex-1 space-y-2">
            {/* Title */}
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            {/* Subtitle */}
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            {/* Location */}
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4 space-y-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-100 rounded-lg"></div>
          <div className="h-20 bg-gray-100 rounded-lg"></div>
        </div>
        
        {type === 'programs' && (
          <>
            {/* Badges */}
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
            
            {/* Course List */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-100 rounded"></div>
              <div className="h-8 bg-gray-100 rounded"></div>
              <div className="h-8 bg-gray-100 rounded"></div>
            </div>
          </>
        )}
        
        {type === 'courses' && (
          <>
            {/* Details */}
            <div className="grid grid-cols-2 gap-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            
            {/* Fee Box */}
            <div className="h-20 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"></div>
          </>
        )}
        
        {type === 'institutes' && (
          <>
            {/* Badges */}
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            
            {/* Placement Box */}
            <div className="h-24 bg-gray-50 rounded-lg"></div>
          </>
        )}
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
