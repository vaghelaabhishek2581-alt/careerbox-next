import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFacilityIcon } from '@/lib/utils/facility-icons'
import { Building2 } from 'lucide-react'

interface Facility {
  key: string
  value?: string
}

interface FacilityListProps {
  facilities?: Facility[]
  facilitiesArray?: string[]
  title?: string
}

export function FacilityList({ facilities, facilitiesArray, title = "Campus Facilities" }: FacilityListProps) {
  const hasFacilities = facilities && facilities.length > 0
  const hasFacilitiesArray = facilitiesArray && facilitiesArray.length > 0

  // Don't render if no data
  if (!hasFacilities && !hasFacilitiesArray) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key-Value Facilities */}
        {hasFacilities && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((facility, idx) => {
              const Icon = getFacilityIcon(facility.key)
              const hasDescription = facility.value && facility.value.trim().length > 0
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-4 rounded-lg border bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow ${
                    hasDescription ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg mb-1">{facility.key}</div>
                    {hasDescription && (
                      <div className="text-sm text-gray-600 leading-relaxed">{facility.value}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Simple Facilities Array */}
        {hasFacilitiesArray && (
          <div className="space-y-2">
            {hasFacilities && <div className="text-sm font-medium text-muted-foreground">Additional Facilities</div>}
            <div className="flex flex-wrap gap-2">
              {facilitiesArray.map((facility, idx) => {
                const Icon = getFacilityIcon(facility)
                return (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1.5 py-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {facility}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
