import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, Award } from 'lucide-react'
import Image from 'next/image'

interface RankData {
  year: number
  rank: string
}

interface PublisherRanking {
  publisherName: string
  publisherLogo?: string
  entityName?: string
  rankData: RankData[]
}

interface RankingsSectionProps {
  title?: string
  description?: string
  rankingsDescription?: string
  nationalRankings?: Array<{
    agency: string
    category: string
    rank: string
    year: string | number
  }>
  publisherRankings?: PublisherRanking[]
}

export function RankingsSection({
  title,
  description,
  rankingsDescription,
  nationalRankings,
  publisherRankings,
}: RankingsSectionProps) {
  const hasNationalRankings = nationalRankings && nationalRankings.length > 0
  const hasPublisherRankings = publisherRankings && publisherRankings.length > 0

  // Don't render if no data
  if (!hasNationalRankings && !hasPublisherRankings && !title && !description) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {title || "Rankings & Accreditations"}
        </CardTitle>
        {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
        {rankingsDescription && <p className="text-sm text-muted-foreground mt-1">{rankingsDescription}</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* National Rankings Table */}
        {hasNationalRankings && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4" />
              National Rankings
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nationalRankings.map((ranking, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{ranking.agency}</TableCell>
                    <TableCell>{ranking.category}</TableCell>
                    <TableCell className="font-bold text-primary">{ranking.rank}</TableCell>
                    <TableCell>{ranking.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Publisher Rankings Cards */}
        {hasPublisherRankings && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Rankings by Publisher</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publisherRankings.map((publisher, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {publisher.publisherLogo && (
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={publisher.publisherLogo}
                          alt={publisher.publisherName}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{publisher.publisherName}</div>
                      {publisher.entityName && (
                        <div className="text-sm text-muted-foreground">{publisher.entityName}</div>
                      )}
                    </div>
                  </div>

                  {publisher.rankData && publisher.rankData.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year</TableHead>
                          <TableHead>Rank</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {publisher.rankData.map((rd, rdIdx) => (
                          <TableRow key={rdIdx}>
                            <TableCell>{rd.year}</TableCell>
                            <TableCell className="font-bold text-primary">{rd.rank}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
