// src/app/api/schedule/create/route.js
import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const body = await request.json()

    const {
      title,
      description,
      createdBy,
      createdByEmail,
      clubId,
      dates,
      startTime,
      endTime,
      timeSlotMinutes,
      visibility,
    } = body

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { message: 'Poll title is required' },
        { status: 400 }
      )
    }

    if (!createdBy?.trim()) {
      return NextResponse.json(
        { message: 'Your name is required' },
        { status: 400 }
      )
    }

    if (!dates || dates.length === 0) {
      return NextResponse.json(
        { message: 'At least one date is required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)

    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const slug = `${baseSlug}-${randomSuffix}`

    // Generate delete token for poll creator
    const deleteToken = crypto.randomBytes(16).toString('hex')

    // Build the document
    const pollDoc = {
      _type: 'availabilityPoll',
      title: title.trim(),
      slug: {
        _type: 'slug',
        current: slug,
      },
      description: description?.trim() || null,
      createdBy: createdBy.trim(),
      createdByEmail: createdByEmail?.trim() || null,
      dates: dates.sort(),
      startTime: startTime || '09:00',
      endTime: endTime || '21:00',
      timeSlotMinutes: parseInt(timeSlotMinutes) || 30,
      timezone: 'America/New_York',
      responses: [],
      createdAt: new Date().toISOString(),
      visibility: visibility || 'public',
      deleteToken: deleteToken,
    }

    // Add club reference if provided
    if (clubId) {
      pollDoc.club = {
        _type: 'reference',
        _ref: clubId,
      }
    }

    // Create the poll in Sanity
    const result = await client.create(pollDoc)

    return NextResponse.json({
      message: 'Poll created successfully',
      slug: slug,
      id: result._id,
      deleteToken: deleteToken,
      visibility: visibility || 'public',
    })
  } catch (error) {
    console.error('Create poll error:', error)
    return NextResponse.json(
      { message: 'Failed to create poll. Please try again.' },
      { status: 500 }
    )
  }
}
