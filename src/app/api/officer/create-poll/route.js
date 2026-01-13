// src/app/api/officer/create-poll/route.js
import { client } from '@/sanity/lib/client'
import { verifySecureToken } from '@/lib/secure-tokens'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(request) {
  try {
    // Verify officer session
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('officer_session')?.value

    if (!sessionToken) {
      return Response.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const verification = await verifySecureToken(sessionToken)
    if (!verification.valid) {
      return Response.json(
        { error: 'Invalid or expired session', code: 'INVALID_SESSION' },
        { status: 401 }
      )
    }

    const { title, description, dates, timeSlots, visibility } = await request.json()

    if (!title) {
      return Response.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      )
    }

    if (!dates || dates.length === 0) {
      return Response.json(
        { error: 'At least one date is required', code: 'MISSING_DATES' },
        { status: 400 }
      )
    }

    if (!timeSlots || timeSlots.length === 0) {
      return Response.json(
        { error: 'At least one time slot is required', code: 'MISSING_TIMESLOTS' },
        { status: 400 }
      )
    }

    // Generate slug and delete token
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)

    const deleteToken = crypto.randomBytes(16).toString('hex')

    // Get officer's name from member
    const officer = await client.fetch(
      `*[_type == "clubOfficer" && _id == $officerId][0]{
        member->{name}
      }`,
      { officerId: verification.data.officerId }
    )
    const createdBy = officer?.member?.name || verification.data.email

    // Create poll in Sanity
    const poll = await client.create({
      _type: 'availabilityPoll',
      title,
      slug: { _type: 'slug', current: slug },
      description: description || '',
      dates,
      timeSlots,
      createdBy,
      createdAt: new Date().toISOString(),
      visibility: visibility || 'unlisted', // Default to unlisted for officer-created polls
      deleteToken,
      responses: [],
      club: {
        _type: 'reference',
        _ref: verification.data.clubId
      }
    })

    return Response.json({
      success: true,
      message: 'Poll created successfully',
      poll: {
        id: poll._id,
        title: poll.title,
        slug: slug,
        deleteToken
      }
    })

  } catch (error) {
    console.error('Create poll error:', error)
    return Response.json(
      { error: 'Failed to create poll. Please try again.' },
      { status: 500 }
    )
  }
}
