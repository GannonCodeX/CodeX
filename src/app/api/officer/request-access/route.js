// src/app/api/officer/request-access/route.js
import { client } from '@/sanity/lib/client'
import crypto from 'crypto'
import { Resend } from 'resend'
import { OfficerMagicLinkEmail } from '@/app/components/emails/OfficerMagicLinkEmail'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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

    // Get role from member.affiliations for this club
    const clubAffiliation = officer.member?.affiliations?.find(
      (a) => a.club?._ref === officer.club._id
    )
    const role = clubAffiliation?.clubRole || 'Officer'
    const officerName = officer.member?.name || 'Officer'

    // Send magic link email
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Gannon CodeX <noreply@codexgu.dev>',
          to: [email],
          subject: `Officer Dashboard Access - ${officer.club.title}`,
          react: OfficerMagicLinkEmail({
            officerName,
            clubName: officer.club.title,
            magicLink,
            expiresIn: '24 hours'
          })
        })
        console.log(`Magic link email sent to ${email}`)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the request if email fails, just log it
      }
    } else {
      // Log the magic link if email not configured
      console.log('=================================================')
      console.log('OFFICER ACCESS MAGIC LINK (Email not configured)')
      console.log('=================================================')
      console.log(`Officer: ${officerName}`)
      console.log(`Club: ${officer.club.title}`)
      console.log(`Role: ${role}`)
      console.log(`Link: ${magicLink}`)
      console.log(`Expires: ${tokenExpiry}`)
      console.log('=================================================')
    }

    return Response.json({
      success: true,
      message: resend
        ? 'Access link sent! Check your email for the magic link.'
        : 'Access link generated! Check the server console for the link (email not configured).',
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
