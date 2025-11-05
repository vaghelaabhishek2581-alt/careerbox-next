import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import AdminInstitute from '@/src/models/AdminInstitute'
import SearchSuggestion from '@/src/models/SearchSuggestion'
import { populateSuggestionsFromInstitute, upsertSuggestions } from '@/lib/utils/populate-suggestions'

// POST /api/admin/rebuild-suggestions - Rebuild all search suggestions
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    // Clear existing suggestions
    await SearchSuggestion.deleteMany({})

    // Fetch all institutes
    const institutes = await AdminInstitute.find({}).select('publicId name slug logo location programmes courses')
    
    const allSuggestions = []
    let instituteCount = 0
    let suggestionCount = 0

    // Generate suggestions for each institute
    for (const institute of institutes) {
      const suggestions = await populateSuggestionsFromInstitute(institute.toObject())
      allSuggestions.push(...suggestions)
      instituteCount++
      suggestionCount += suggestions.length
    }

    // Bulk insert all suggestions
    if (allSuggestions.length > 0) {
      await upsertSuggestions(allSuggestions)
    }

    return NextResponse.json({
      success: true,
      message: 'Search suggestions rebuilt successfully',
      stats: {
        institutesProcessed: instituteCount,
        suggestionsCreated: suggestionCount,
      },
    })
  } catch (err: any) {
    console.error('Failed to rebuild suggestions:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to rebuild suggestions' },
      { status: 500 }
    )
  }
}
