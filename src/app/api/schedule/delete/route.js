// src/app/api/schedule/delete/route.js
import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(request) {
  try {
    const { pollId, deleteToken } = await request.json()

    if (!pollId || !deleteToken) {
      return NextResponse.json(
        { message: 'Poll ID and delete token are required' },
        { status: 400 }
      )
    }

    // Find the poll and verify the delete token
    const poll = await client.fetch(
      `*[_type == "availabilityPoll" && _id == $pollId][0]{
        _id,
        title,
        deleteToken
      }`,
      { pollId }
    )

    if (!poll) {
      return NextResponse.json(
        { message: 'Poll not found' },
        { status: 404 }
      )
    }

    if (poll.deleteToken !== deleteToken) {
      return NextResponse.json(
        { message: 'Invalid delete token. You can only delete polls you created.' },
        { status: 403 }
      )
    }

    // Delete the poll
    await client.delete(pollId)

    return NextResponse.json({
      message: 'Poll deleted successfully',
      deletedId: pollId,
    })
  } catch (error) {
    console.error('Delete poll error:', error)
    return NextResponse.json(
      { message: 'Failed to delete poll. Please try again.' },
      { status: 500 }
    )
  }
}
