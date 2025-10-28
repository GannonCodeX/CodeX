// src/app/api/send-application-confirmation/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ApplicationConfirmationEmail } from '../../components/emails/ApplicationConfirmationEmail';

// Only initialize Resend if API key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request) {
  try {
    const { to, applicantName, projectTitle, trackingId } = await request.json();
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/application-status/${trackingId}`;

    if (!to || !applicantName || !projectTitle || !trackingId) {
      return NextResponse.json({ message: 'Missing required fields for email.' }, { status: 400 });
    }

    // Check if Resend is configured
    if (!resend) {
      console.warn('Resend API key not configured. Skipping email notification.');
      return NextResponse.json({ 
        message: 'Email service not configured, but application was processed successfully.',
        warning: 'No confirmation email sent'
      }, { status: 200 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Gannon CodeX <noreply@codexgu.dev>',
      to: [to],
      subject: `Application Received: ${projectTitle}`,
      react: ApplicationConfirmationEmail({ applicantName, projectTitle, trackingId, trackingUrl }),
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ message: 'Failed to send email.', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Application confirmation email sent successfully!', data }, { status: 200 });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
  }
}