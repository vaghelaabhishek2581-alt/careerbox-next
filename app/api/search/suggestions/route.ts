import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { SearchSuggestion, SearchSuggestionsResponse } from '@/lib/types/search.types'

// GET /api/search/suggestions - Search suggestions endpoint
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        total: 0,
        query
      } as SearchSuggestionsResponse)
    }

    const db = await connectDB()
    const suggestions: SearchSuggestion[] = []

    // Search users
    const users = await db.collection('users').find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'personalDetails.publicProfileId': { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    }).limit(3).toArray()

    suggestions.push(...users.map(user => ({
      id: user._id.toString(),
      text: user.name,
      type: 'user' as const,
      category: 'users',
      popularity: user.stats?.connections || 0,
      metadata: { 
        profileId: user.personalDetails?.publicProfileId,
        role: user.role,
        location: user.location
      }
    })))

    // Search businesses
    const businesses = await db.collection('businesses').find({
      companyName: { $regex: query, $options: 'i' },
      status: 'active'
    }).limit(3).toArray()

    suggestions.push(...businesses.map(business => ({
      id: business._id.toString(),
      text: business.companyName,
      type: 'business' as const,
      category: 'businesses',
      popularity: business.stats?.jobPostings || 0,
      metadata: { 
        industry: business.industry,
        location: business.headquarters?.city,
        size: business.size
      }
    })))

    // Search institutes
    const institutes = await db.collection('institutes').find({
      instituteName: { $regex: query, $options: 'i' },
      status: 'active'
    }).limit(3).toArray()

    suggestions.push(...institutes.map(institute => ({
      id: institute._id.toString(),
      text: institute.instituteName,
      type: 'institute' as const,
      category: 'institutes',
      popularity: institute.stats?.courses || 0,
      metadata: { 
        type: institute.type,
        location: institute.address?.city,
        verified: institute.isVerified
      }
    })))

    // Search skills
    const skills = await db.collection('skills').find({
      name: { $regex: query, $options: 'i' }
    }).limit(3).toArray()

    suggestions.push(...skills.map(skill => ({
      id: skill._id.toString(),
      text: skill.name,
      type: 'skill' as const,
      category: 'skills',
      popularity: skill.usageCount || 0,
      metadata: { 
        category: skill.category,
        level: skill.level
      }
    })))

    // Search locations
    const locations = await db.collection('locations').find({
      name: { $regex: query, $options: 'i' }
    }).limit(3).toArray()

    suggestions.push(...locations.map(location => ({
      id: location._id.toString(),
      text: location.name,
      type: 'location' as const,
      category: 'locations',
      popularity: location.usageCount || 0,
      metadata: { 
        country: location.country,
        state: location.state,
        type: location.type
      }
    })))

    // Search industries
    const industries = await db.collection('industries').find({
      name: { $regex: query, $options: 'i' }
    }).limit(3).toArray()

    suggestions.push(...industries.map(industry => ({
      id: industry._id.toString(),
      text: industry.name,
      type: 'industry' as const,
      category: 'industries',
      popularity: industry.usageCount || 0,
      metadata: { 
        category: industry.category,
        description: industry.description
      }
    })))

    // Sort by popularity and relevance
    suggestions.sort((a, b) => {
      // First by text match (exact matches first)
      const aExact = a.text.toLowerCase().startsWith(query.toLowerCase())
      const bExact = b.text.toLowerCase().startsWith(query.toLowerCase())
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // Then by popularity
      return b.popularity - a.popularity
    })

    // Limit results
    const limitedSuggestions = suggestions.slice(0, limit)

    const response: SearchSuggestionsResponse = {
      suggestions: limitedSuggestions,
      total: limitedSuggestions.length,
      query
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
