// src/app/api/officer/create-announcement/route.js
import { client } from '@/sanity/lib/client'
import { verifySecureToken } from '@/lib/secure-tokens'
import { cookies } from 'next/headers'

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

    const { title, content, type, pinned } = await request.json()

    if (!title || !content) {
      return Response.json(
        { error: 'Title and content are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      )
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)

    // Create announcement in Sanity
    const announcement = await client.create({
      _type: 'announcement',
      title,
      slug: { _type: 'slug', current: slug },
      content: [
        {
          _type: 'block',
          _key: 'block-' + Date.now(),
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: 'span-' + Date.now(),
              text: content,
              marks: []
            }
          ]
        }
      ],
      type: type || 'news',
      pinned: pinned || false,
      publishedAt: new Date().toISOString(),
      club: {
        _type: 'reference',
        _ref: verification.data.clubId
      }
    })

    return Response.json({
      success: true,
      message: 'Announcement created successfully',
      announcement: {
        id: announcement._id,
        title: announcement.title,
        slug: slug
      }
    })

  } catch (error) {
    console.error('Create announcement error:', error)
    return Response.json(
      { error: 'Failed to create announcement. Please try again.' },
      { status: 500 }
    )
  }
}
