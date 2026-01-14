import { NextResponse } from 'next/server'
import { client } from '@/sanity/client'
import { cookies } from 'next/headers'

export async function DELETE(request) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('officer_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify session
    const verification = await fetch(new URL('/api/officer/verify-session', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sessionToken })
    })

    if (!verification.ok) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const verificationData = await verification.json()
    const { announcementId } = await request.json()

    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    // Verify the announcement belongs to this officer's club
    const announcement = await client.fetch(
      `*[_type == "announcement" && _id == $id && club._ref == $clubId][0]`,
      { id: announcementId, clubId: verificationData.data.clubId }
    )

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found or access denied' }, { status: 404 })
    }

    // Delete the announcement
    await client.delete(announcementId)

    return NextResponse.json({ success: true, message: 'Announcement deleted' })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
