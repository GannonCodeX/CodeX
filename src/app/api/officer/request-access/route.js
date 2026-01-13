// src/app/api/officer/request-access/route.js
import { client } from '@/sanity/lib/client'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return Response.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Please enter a valid email address', code: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    // Debug: first check if any officer exists with this email
    const debugQuery = await client.fetch(
      `*[_type == "clubOfficer" && lower(email) == lower($email)][0]{
        _id,
        email,
        isActive,
        "hasClub": defined(club),
        "hasMember": defined(member)
      }`,
      { email: email.trim() }
    )
    console.log('Debug - Officer lookup:', JSON.stringify(debugQuery, null, 2))

    // Check if email exists in clubOfficer with isActive=true
    // Role comes from member.affiliations[] not from clubOfficer
    // Use lower() for case-insensitive email matching
    const officer = await client.fetch(
      `*[_type == "clubOfficer" && lower(email) == lower($email) && isActive == true][0]{
        _id,
        email,
        isActive,
        club->{
          _id,
          title,
          "slug": slug.current
        },
        member->{
          name,
          affiliations
        }
      }`,
      { email: email.trim() }
    )
    console.log('Debug - Full officer result:', JSON.stringify(officer, null, 2))

    if (!officer) {
      // Provide more helpful error message
      if (debugQuery && !debugQuery.isActive) {
        return Response.json(
          {
            error: 'Your officer account is inactive. Please contact an admin.',
            code: 'INACTIVE'
          },
          { status: 403 }
        )
      }
      return Response.json(
        {
          error: 'No active officer account found with this email address',
          code: 'NOT_FOUND'
        },
        { status: 403 }
      )
    }

    // Generate secure token (24 hour expiry)
    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Store token in Sanity
    await client.patch(officer._id).set({
      accessToken: token,
      tokenExpiry: tokenExpiry
    }).commit()

    // Create magic link
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const magicLink = `${baseUrl}/officer/${officer.club.slug}?token=${token}`

    // Log the magic link (email sending out of scope)
    // Get role from member.affiliations for this club
    const clubAffiliation = officer.member?.affiliations?.find(
      (a) => a.club?._ref === officer.club._id
    )
    const role = clubAffiliation?.clubRole || 'Officer'
    console.log('=================================================')
    console.log('OFFICER ACCESS MAGIC LINK')
    console.log('=================================================')
    console.log(`Officer: ${officer.member?.name || officer.email}`)
    console.log(`Club: ${officer.club.title}`)
    console.log(`Role: ${role}`)
    console.log(`Link: ${magicLink}`)
    console.log(`Expires: ${tokenExpiry}`)
    console.log('=================================================')

    return Response.json({
      success: true,
      message: 'Access link sent! Check your email for the magic link.',
      clubSlug: officer.club.slug,
      expiresIn: '24 hours'
    })

  } catch (error) {
    console.error('Request access error:', error)
    return Response.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}
