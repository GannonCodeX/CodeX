// src/app/api/officer/verify/route.js
import { client } from '@/sanity/lib/client'
import { generateSecureToken } from '@/lib/secure-tokens'

export async function POST(request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return Response.json(
        { error: 'Token is required', code: 'MISSING_TOKEN' },
        { status: 400 }
      )
    }

    // Find officer with this token
    // Role comes from member.affiliations[] not from clubOfficer
    const officer = await client.fetch(
      `*[_type == "clubOfficer" && accessToken == $token && isActive == true][0]{
        _id,
        email,
        tokenExpiry,
        member->{
          _id,
          name,
          avatar,
          affiliations
        },
        club->{
          _id,
          title,
          "slug": slug.current,
          logo,
          shortName
        }
      }`,
      { token }
    )

    if (!officer) {
      return Response.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }

    // Check if token is expired
    if (new Date(officer.tokenExpiry) < new Date()) {
      return Response.json(
        { error: 'Token has expired. Please request a new access link.', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      )
    }

    // Get role from member.affiliations for this club
    const clubAffiliation = officer.member?.affiliations?.find(
      (a) => a.club?._ref === officer.club._id
    )
    const role = clubAffiliation?.clubRole || 'Officer'

    // Generate a new session token (valid for 8 hours)
    const sessionToken = await generateSecureToken({
      officerId: officer._id,
      email: officer.email,
      clubId: officer.club._id,
      clubSlug: officer.club.slug,
      role: role,
      action: 'officer-dashboard'
    }, 8)

    // Clear the one-time access token
    await client.patch(officer._id).set({
      accessToken: null,
      tokenExpiry: null
    }).commit()

    return Response.json({
      success: true,
      sessionToken,
      officer: {
        email: officer.email,
        role: role,
        member: officer.member ? {
          name: officer.member.name,
          avatar: officer.member.avatar
        } : null
      },
      club: {
        id: officer.club._id,
        title: officer.club.title,
        slug: officer.club.slug,
        shortName: officer.club.shortName,
        logo: officer.club.logo
      },
      expiresIn: '8 hours'
    })

  } catch (error) {
    console.error('Verify token error:', error)
    return Response.json(
      { error: 'Failed to verify token. Please try again.' },
      { status: 500 }
    )
  }
}
