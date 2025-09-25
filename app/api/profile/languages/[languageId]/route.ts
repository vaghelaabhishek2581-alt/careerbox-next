import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongoose'
import { Profile } from '@/src/models'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/unified-auth'
import { ILanguage } from '@/lib/types/profile.unified'

const LanguageSchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'FLUENT', 'NATIVE']),
  certifications: z.array(z.string()).optional()
})

// PUT - Update a specific language
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ languageId: string }> }
) {
  try {
    const { languageId } = await params
    console.log('🔄 PUT /api/profile/languages/[languageId] - Updating language:', languageId)

    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    const body = await request.json()
    const validatedData = LanguageSchema.parse(body)

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find and update the language
    const languageIndex = profile.languages.findIndex((lang: ILanguage) => lang.id === languageId)
    if (languageIndex === -1) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    // Check if language name already exists (excluding current language)
    const existingLanguage = profile.languages.find(
      (lang: ILanguage, index: number) =>
        index !== languageIndex &&
        lang.name.toLowerCase() === validatedData.name.toLowerCase()
    )
    if (existingLanguage) {
      return NextResponse.json({ error: 'Language name already exists' }, { status: 400 })
    }

    // Update the language while preserving the id
    profile.languages[languageIndex] = {
      ...profile.languages[languageIndex],
      ...validatedData,
      id: profile.languages[languageIndex].id // Explicitly preserve the id
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
  { params }: { params: Promise<{ languageId: string }> }
) {
  try {
    const { languageId } = await params
    console.log('🗑️ DELETE /api/profile/languages/[languageId] - Deleting language:', languageId)

    const authCheck = await requireAuth(request)
    if (authCheck.error) return authCheck.response

    await connectToDatabase()

    const profile = await Profile.findOne({ userId: authCheck.auth.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Remove the language
    const initialLength = profile.languages.length
    profile.languages = profile.languages.filter((lang: ILanguage) => lang.id !== languageId)

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