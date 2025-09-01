// src/app/api/send-confirmation/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ConfirmationEmail } from '../../components/emails/ConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, proposerName, projectName, trackingId } = await request.json();
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/proposal-status/${trackingId}`;

    if (!to || !proposerName || !projectName || !trackingId) {
      return NextResponse.json({ message: 'Missing required fields for email.' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Gannon CodeX <noreply@codexgu.dev>',
      to: [to],
      subject: `Project Proposal Received: ${projectName}`,
      react: ConfirmationEmail({ proposerName, projectName, trackingId, trackingUrl }),
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ message: 'Failed to send email.', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Confirmation email sent successfully!', data }, { status: 200 });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ message: 'Internal server error.', error: error.message }, { status: 500 });
  }
}
