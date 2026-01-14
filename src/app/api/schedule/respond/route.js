// src/app/api/schedule/respond/route.js
import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(request) {
  try {
    const body = await request.json()

    const { pollId, name, email, availability } = body

    // Validation
    if (!pollId) {
      return NextResponse.json(
        { message: 'Poll ID is required' },
        { status: 400 }
      )
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { message: 'Your name is required' },
        { status: 400 }
      )
    }

    if (!availability || !Array.isArray(availability)) {
      return NextResponse.json(
        { message: 'Availability data is required' },
        { status: 400 }
      )
    }

    // Fetch the current poll
    const poll = await client.fetch(
      `*[_type == "availabilityPoll" && _id == $pollId][0]{
        _id,
        responses
      }`,
      { pollId }
    )

    if (!poll) {
      return NextResponse.json(
        { message: 'Poll not found' },
        { status: 404 }
      )
    }

    // Check if this person already responded (by name)
    const existingResponses = poll.responses || []
    const existingIndex = existingResponses.findIndex(
      (r) => r.name.toLowerCase() === name.trim().toLowerCase()
    )

    const newResponse = {
      _key: Math.random().toString(36).substring(2, 10),
      name: name.trim(),
      email: email?.trim() || null,
      availability: availability,
      submittedAt: new Date().toISOString(),
    }

    let updatedResponses
    if (existingIndex >= 0) {
      // Update existing response
      updatedResponses = [...existingResponses]
      updatedResponses[existingIndex] = {
        ...newResponse,
        _key: existingResponses[existingIndex]._key, // Keep same key
      }
    } else {
      // Add new response
      updatedResponses = [...existingResponses, newResponse]
    }

    // Update the poll
    await client
      .patch(pollId)
      .set({ responses: updatedResponses })
      .commit()

    return NextResponse.json({
      message: existingIndex >= 0 ? 'Response updated' : 'Response submitted',
      responseCount: updatedResponses.length,
    })
  } catch (error) {
    console.error('Submit response error:', error)
    return NextResponse.json(
      { message: 'Failed to submit response. Please try again.' },
      { status: 500 }
    )
  }
}
