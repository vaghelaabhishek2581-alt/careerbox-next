import React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KeyValuePair {
  key: string
  value: string | number
}

interface KeyValueTableProps {
  title?: string
  data: KeyValuePair[] | Record<string, string | number>
  icon?: React.ReactNode
  className?: string
}

export function KeyValueTable({ title, data, icon, className }: KeyValueTableProps) {
  // Convert to array if it's an object
  const items: KeyValuePair[] = Array.isArray(data)
    ? data
    : Object.entries(data).map(([key, value]) => ({ key, value }))

  // Don't render if no data
  if (!items || items.length === 0) return null

  const content = (
    <Table>
      <TableBody>
        {items.map((item, idx) => (
          <TableRow key={idx}>
            <TableCell className="font-medium w-1/3 bg-gray-50">{item.key}</TableCell>
            <TableCell>{item.value || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    )
  }

  return <div className={className}>{content}</div>
}
