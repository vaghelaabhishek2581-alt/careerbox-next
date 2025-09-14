import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'

const LanguageSchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE']),
  certifications: z.array(z.string()).optional()
})

// PUT - Update a specific language
export async function PUT(
  request: NextRequest,
  { params }: { params: { languageId: string } }
) {
  try {
    console.log('🔄 PUT /api/profile/languages/[languageId] - Updating language:', params.languageId)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = LanguageSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find and update the language
    const languageIndex = profile.languages.findIndex(lang => lang.id === params.languageId)
    if (languageIndex === -1) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    // Check if language name already exists (excluding current language)
    const existingLanguage = profile.languages.find(
      (lang, index) => 
        index !== languageIndex && 
        lang.name.toLowerCase() === validatedData.name.toLowerCase()
    )
    if (existingLanguage) {
      return NextResponse.json({ error: 'Language name already exists' }, { status: 400 })
    }

    // Update the language
    profile.languages[languageIndex] = {
      ...profile.languages[languageIndex],
      ...validatedData
    }

    await profile.save()

    return NextResponse.json({ 
      success: true, 
      language: profile.languages[languageIndex],
      message: 'Language updated successfully' 
    })

  } catch (error) {
    console.error('❌ Error updating language:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update language' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a specific language
export async function DELETE(
  request: NextRequest,
  { params }: { params: { languageId: string } }
) {
  try {
    console.log('🗑️ DELETE /api/profile/languages/[languageId] - Deleting language:', params.languageId)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Remove the language
    const initialLength = profile.languages.length
    profile.languages = profile.languages.filter(lang => lang.id !== params.languageId)
    
    if (profile.languages.length === initialLength) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    await profile.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Language deleted successfully' 
    })

  } catch (error) {
    console.error('❌ Error deleting language:', error)
    return NextResponse.json(
      { error: 'Failed to delete language' },
      { status: 500 }
    )
  }
}
