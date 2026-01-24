import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified-auth'
import { connectToDatabase } from '@/lib/db/mongodb'
import AdminInstitute from '@/src/models/AdminInstitute'
import Institute from '@/src/models/Institute'
import { z } from 'zod'
import mongoose from 'mongoose'

const patchSchema = z.object({
  published: z.boolean()
})

function determineActorRole (user: any): 'admin' | 'institute_admin' {
  if (user?.roles?.includes('admin')) return 'admin'
  return 'institute_admin'
}

export async function GET (
  req: NextRequest,
  ctx: { params: Promise<{ instituteId: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { instituteId } = await ctx.params
    if (!mongoose.Types.ObjectId.isValid(instituteId)) {
      return NextResponse.json(
        { error: 'Invalid institute id' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // First, try to find by ID in AdminInstitute
    const adminInst: any = await AdminInstitute.findById(instituteId)
      .lean()
      .exec()
    if (adminInst) {
      const isAdmin = auth.user?.roles?.includes('admin')
      const isOwner = (adminInst.userIds || [])
        .map((id: any) => id.toString())
        .includes(auth.userId)

      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        data: {
          slug: adminInst.slug,
          published: !!adminInst.published,
          publishLockedByAdmin: !!adminInst.publishLockedByAdmin,
          lastPublishChangedBy: adminInst.lastPublishChangedBy || null,
          lastPublishedAt: adminInst.lastPublishedAt || null,
          lastUnpublishedAt: adminInst.lastUnpublishedAt || null
        }
      })
    }

    // Fall back to Institute collection
    const account = await Institute.findById(instituteId).lean().exec()
    if (!account) {
      return NextResponse.json(
        { error: 'Institute not found' },
        { status: 404 }
      )
    }

    const isAdmin = auth.user?.roles?.includes('admin')
    const isOwner = account.userId?.toString() === auth.userId
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if there's an AdminInstitute record by slug
    if (account.publicProfileId) {
      const bySlug: any = await AdminInstitute.findOne({
        slug: account.publicProfileId
      })
        .lean()
        .exec()

      if (bySlug) {
        return NextResponse.json({
          success: true,
          data: {
            slug: bySlug.slug,
            published: !!bySlug.published,
            publishLockedByAdmin: !!bySlug.publishLockedByAdmin,
            lastPublishChangedBy: bySlug.lastPublishChangedBy || null,
            lastPublishedAt: bySlug.lastPublishedAt || null,
            lastUnpublishedAt: bySlug.lastUnpublishedAt || null
          }
        })
      }
    }

    // No AdminInstitute record exists - return default (published, not locked)
    return NextResponse.json({
      success: true,
      data: {
        slug: account.publicProfileId || '',
        published: true,
        publishLockedByAdmin: false,
        lastPublishChangedBy: null,
        lastPublishedAt: null,
        lastUnpublishedAt: null
      }
    })
  } catch (error) {
    console.error('GET /publish-status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH (
  req: NextRequest,
  ctx: { params: Promise<{ instituteId: string }> }
) {
  const debugId = `[PATCH-${Date.now()}]`

  try {
    console.log(`${debugId} ========== START PATCH REQUEST ==========`)

    const auth = await getAuthenticatedUser(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { instituteId } = await ctx.params
    console.log(`${debugId} instituteId:`, instituteId)

    if (!mongoose.Types.ObjectId.isValid(instituteId)) {
      return NextResponse.json(
        { error: 'Invalid institute id' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parseResult = patchSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.errors },
        { status: 400 }
      )
    }

    const { published } = parseResult.data
    console.log(`${debugId} Target published value:`, published)

    await connectToDatabase()

    const isAdmin = auth.user?.roles?.includes('admin')
    const actor = determineActorRole(auth.user)
    const now = new Date()

    // Step 1: Try to find existing AdminInstitute by ID
    let adminInst: any = await AdminInstitute.findById(instituteId)
      .lean()
      .exec()
    console.log(
      `${debugId} AdminInstitute by ID:`,
      adminInst?._id?.toString() || 'NOT FOUND'
    )

    let slug: any = ''
    let name: any = ''
    let userIds: any = []

    if (adminInst) {
      // Found by ID - check permissions
      const isOwner = (adminInst.userIds || [])
        .map((id: any) => id.toString())
        .includes(auth.userId)

      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Check lock status
      if (
        actor === 'institute_admin' &&
        published &&
        adminInst.publishLockedByAdmin
      ) {
        return NextResponse.json(
          {
            error: 'Publishing is locked by admin. Contact support to unlock.'
          },
          { status: 403 }
        )
      }

      slug = adminInst.slug || ''
      name = adminInst.name || ''
      userIds = adminInst.userIds || []
    } else {
      // Not found by ID - look up Institute
      const account = await Institute.findById(instituteId).lean().exec()
      console.log(
        `${debugId} Institute found:`,
        account?._id?.toString() || 'NOT FOUND'
      )

      if (!account) {
        return NextResponse.json(
          { error: 'Institute not found' },
          { status: 404 }
        )
      }

      const isOwner = account.userId?.toString() === auth.userId
      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Check if AdminInstitute exists by slug
      const accountSlug = account.publicProfileId || (account as any).id || ''
      console.log(`${debugId} Looking for AdminInstitute by slug:`, accountSlug)

      if (accountSlug) {
        const bySlug: any = await AdminInstitute.findOne({ slug: accountSlug })
          .lean()
          .exec()

        if (bySlug) {
          // Found by slug - check lock status
          if (
            actor === 'institute_admin' &&
            published &&
            bySlug.publishLockedByAdmin
          ) {
            return NextResponse.json(
              {
                error:
                  'Publishing is locked by admin. Contact support to unlock.'
              },
              { status: 403 }
            )
          }

          // Use findOneAndUpdate on the slug-matched document
          const updateData: any = {
            published,
            lastPublishChangedBy: actor,
            updatedAt: now
          }

          if (actor === 'admin') {
            updateData.publishLockedByAdmin = !published
          }

          if (published) {
            updateData.lastPublishedAt = now
          } else {
            updateData.lastUnpublishedAt = now
          }

          const updatedDoc: any = await AdminInstitute.findByIdAndUpdate(
            bySlug._id,
            { $set: updateData },
            { new: true, runValidators: true }
          )
            .lean()
            .exec()

          return NextResponse.json({
            success: true,
            data: {
              slug: updatedDoc?.slug || '',
              published: !!updatedDoc?.published,
              publishLockedByAdmin: !!updatedDoc?.publishLockedByAdmin,
              lastPublishChangedBy: updatedDoc?.lastPublishChangedBy || null,
              lastPublishedAt: updatedDoc?.lastPublishedAt || null,
              lastUnpublishedAt: updatedDoc?.lastUnpublishedAt || null
            }
          })
        }
      }

      // No AdminInstitute exists - prepare data for upsert
      slug = accountSlug
      name = (account as any).instituteName || (account as any).name || ''
      userIds = account.userId ? [account.userId] : []
    }

    // Build the update object
    const updateData: any = {
      published,
      lastPublishChangedBy: actor,
      updatedAt: now
    }

    if (actor === 'admin') {
      updateData.publishLockedByAdmin = !published
    }

    if (published) {
      updateData.lastPublishedAt = now
    } else {
      updateData.lastUnpublishedAt = now
    }

    const savedDoc: any = await AdminInstitute.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(instituteId) },
      {
        $set: updateData,
        $setOnInsert: {
          slug,
          name,
          userIds,
          createdAt: now
        }
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        runValidators: true // Run schema validators
      }
    )
      .lean()
      .exec()

    // Verify the save worked
    const verifyDoc: any = await AdminInstitute.findById(instituteId)
      .lean()
      .exec()

    if (verifyDoc?.published !== published) {
      const db = mongoose.connection.db
      if (db) {
        const result = await db
          .collection('admininstitutes')
          .findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(instituteId) },
            { $set: { published, updatedAt: now } },
            { returnDocument: 'after' }
          )
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        slug: savedDoc?.slug || '',
        published: !!savedDoc?.published,
        publishLockedByAdmin: !!savedDoc?.publishLockedByAdmin,
        lastPublishChangedBy: savedDoc?.lastPublishChangedBy || null,
        lastPublishedAt: savedDoc?.lastPublishedAt || null,
        lastUnpublishedAt: savedDoc?.lastUnpublishedAt || null
      }
    })
  } catch (error: any) {
    console.error(`${debugId} ========== ERROR ==========`)
    console.error(`${debugId} Error:`, error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    // Check for duplicate key error
    if (error.code === 11000) {
      console.error(`${debugId} Duplicate key error:`, error.keyValue)
      return NextResponse.json(
        {
          error: 'A record with this slug already exists',
          details: error.keyValue
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
