import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Users } from 'lucide-react'

interface FacultyData {
  key: string
  value: string
}

interface StudentSection {
  title: string
  data: Array<{
    key: string
    value: string
  }>
}

interface FacultyStudentSectionProps {
  faculties?: FacultyData[]
  students?: StudentSection[]
}

export function FacultyStudentSection({ faculties, students }: FacultyStudentSectionProps) {
  // Filter out metadata fields from faculties (faculty_page_* fields)
  const filteredFaculties = faculties?.filter(f => !f.key.startsWith('faculty_page_'))

  // Separate student sections from top-level metadata
  const studentSections: any = students?.filter((s: any) => s.title && s.data && Array.isArray(s.data)) as StudentSection[]
  const studentMetadata = students?.filter((s: any) => s.key && s.value)
  const studentDescription: any = studentMetadata?.find((s: any) => s.key === 'description')

  const hasFaculties = filteredFaculties && filteredFaculties.length > 0
  const hasStudentSections = studentSections && studentSections.length > 0

  // Don't render if no data
  if (!hasFaculties && !hasStudentSections) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Faculty & Student Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Faculty Description (if exists) */}
        {faculties?.find((f: any) => f.key === 'faculty_page_description') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {faculties.find((f: any) => f.key === 'faculty_page_description')?.value}
            </p>
          </div>
        )}

        {/* Faculty Statistics */}
        {hasFaculties && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Faculty Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredFaculties.map((faculty, idx) => (
                <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{faculty.value}</div>
                  <div className="text-sm text-gray-700 font-medium">{faculty.key}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Description */}
        {studentDescription && studentDescription?.value && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {studentDescription.value}
            </p>
          </div>
        )}

        {/* Student Admission Reports */}
        {hasStudentSections && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Student Admission Reports</h3>
            {studentSections.map((section: any, idx: any) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 space-y-3 bg-white hover:shadow-md transition-shadow">
                <div className="font-semibold text-base text-primary pb-2 border-b">{section.title}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {section.data.map((item: any, itemIdx: any) => (
                    <div key={itemIdx} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">{item.key}</div>
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
