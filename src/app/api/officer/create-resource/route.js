// src/app/api/officer/create-resource/route.js
import { client } from '@/sanity/lib/client'
import { verifySecureToken } from '@/lib/secure-tokens'
import { cookies } from 'next/headers'
import { validateResourceInput } from '@/lib/resources.mjs'

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

    const { value, error } = validateResourceInput(await request.json())
    if (error) return Response.json({ error, code: 'INVALID_RESOURCE' }, { status: 400 })

    // Create resource in Sanity
    const resourceData = {
      _type: 'clubResource',
      ...value,
      accessLevel: 'public',
      publishedAt: new Date().toISOString(),
      club: {
        _type: 'reference',
        _ref: verification.data.clubId
      }
    }

    const resource = await client.create(resourceData)

    return Response.json({
      success: true,
      message: 'Resource created successfully',
      resource: {
        id: resource._id,
        title: resource.title
      }
    })

  } catch (error) {
    console.error('Create resource error:', error)
    return Response.json(
      { error: 'Failed to create resource. Please try again.' },
      { status: 500 }
    )
  }
}
