// src/app/api/contact-club/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ClubContactEmail } from '../../components/emails/ClubContactEmail';

// Only initialize Resend if API key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const { name, email, subject, message, contactEmail, clubName } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message || !contactEmail) {
      return NextResponse.json(
        { message: 'Missing required fields. Please fill out all fields.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!emailRegex.test(contactEmail)) {
      return NextResponse.json(
        { message: 'Invalid club contact email configuration.' },
        { status: 400 }
      );
    }

    // Check if Resend is configured
    if (!resend) {
      console.warn('Resend API key not configured. Skipping email notification.');
      return NextResponse.json(
        {
          message: 'Email service not configured. Please try again later.',
          warning: 'No email sent',
        },
        { status: 503 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Gannon CodeX <noreply@codexgu.dev>',
      to: [contactEmail],
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      react: ClubContactEmail({
        senderName: name,
        senderEmail: email,
        subject,
        message,
        clubName: clubName || 'Your Club',
      }),
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json(
        { message: 'Failed to send message. Please try again later.', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Your message has been sent successfully!', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact Club API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.', error: error.message },
      { status: 500 }
    );
  }
}
