import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const LanguageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE']),
  certifications: z.array(z.string()).optional()
})

const LanguagesUpdateSchema = z.object({
  languages: z.array(LanguageSchema)
})

// GET - Fetch user languages
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/profile/languages - Fetching user languages')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
      .select('languages')
      .lean()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      languages: profile.languages || [] 
    })

  } catch (error) {
    console.error('❌ Error fetching languages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    )
  }
}

// PUT - Update all languages
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/profile/languages - Updating all languages')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = LanguagesUpdateSchema.parse(body)

    await connectToDatabase()

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { 
        $set: {
          languages: validatedData.languages,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      languages: updatedProfile.languages,
      message: 'Languages updated successfully' 
    })

  } catch (error) {
    console.error('❌ Error updating languages:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update languages' },
      { status: 500 }
    )
  }
}

// POST - Add a new language
export async function POST(request: NextRequest) {
  try {
    console.log('➕ POST /api/profile/languages - Adding new language')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedLanguage = LanguageSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if language already exists
    const existingLanguage = profile.languages.find(lang => lang.name.toLowerCase() === validatedLanguage.name.toLowerCase())
    if (existingLanguage) {
      return NextResponse.json({ error: 'Language already exists' }, { status: 400 })
    }

    // Add new language
    profile.languages.push(validatedLanguage)
    await profile.save()

    return NextResponse.json({ 
      success: true, 
      language: validatedLanguage,
      message: 'Language added successfully' 
    })

  } catch (error) {
    console.error('❌ Error adding language:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to add language' },
      { status: 500 }
    )
  }
}
