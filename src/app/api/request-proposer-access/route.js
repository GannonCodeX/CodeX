// app/api/request-proposer-access/route.js
import { client } from '@/sanity/lib/client'
import { Resend } from 'resend'
import { generateSecureToken } from '@/lib/secure-tokens'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, projectSlug } = await request.json()

    if (!email || !projectSlug) {
      return Response.json(
        { 
          error: 'Missing required information. Please provide both email and project identifier.',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { 
          error: 'Please enter a valid email address.',
          code: 'INVALID_EMAIL_FORMAT'
        },
        { status: 400 }
      )
    }

    // Verify the email belongs to the project proposer
    const project = await client.fetch(
      `*[_type == "project" && slug.current == $projectSlug && proposerEmail == $email][0]{
        _id,
        title,
        proposerEmail,
        proposerName
      }`,
      { projectSlug, email }
    )

    if (!project) {
      return Response.json(
        { 
          error: 'Access denied. The email address does not match the project proposer, or the project does not exist.',
          code: 'ACCESS_DENIED'
        },
        { status: 403 }
      )
    }

    // Generate secure token (expires in 2 hours)
    const token = await generateSecureToken({
      email,
      projectSlug,
      projectId: project._id,
      action: 'manage-applications'
    }, 2)

    // Create access URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const accessUrl = `${baseUrl}/projects/${projectSlug}/applications?token=${token}`

    // Send email with secure link
    const { data, error } = await resend.emails.send({
      from: 'Gannon CodeX <noreply@codexgu.dev>',
      to: [email],
      subject: `Manage Applications - ${project.title}`,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Manage Your Project Applications</h2>
          
          <p>Hello ${project.proposerName || 'there'},</p>
          
          <p>You requested access to manage applications for your project: <strong>${project.title}</strong></p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #007acc;">
            <p style="margin: 0;"><strong>Click the link below to access your applications dashboard:</strong></p>
            <p style="margin: 10px 0 0 0;">
              <a href="${accessUrl}" 
                 style="background: #007acc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Manage Applications
              </a>
            </p>
          </div>
          
          <p><strong>Security Information:</strong></p>
          <ul>
            <li>This link is valid for 2 hours only</li>
            <li>It's unique to you and this specific request</li>
            <li>Don't share this link with others</li>
          </ul>
          
          <p>If you didn't request this access, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Gannon University CodeX Club<br>
            This email was sent because you are the proposer for project "${project.title}"
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Resend Error:', error);
      return Response.json(
        { error: 'Failed to send access email. Please try again.' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Access link sent to your email. Please check your inbox.',
      expiresIn: '2 hours'
    })

  } catch (error) {
    console.error('Error sending access link:', error)
    return Response.json(
      { error: 'Failed to send access link. Please try again.' },
      { status: 500 }
    )
  }
}