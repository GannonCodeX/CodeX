// src/app/components/emails/ApplicationConfirmationEmail.js
import React from 'react';

export const ApplicationConfirmationEmail = ({ applicantName, projectTitle, trackingId, trackingUrl }) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <h1 style={{ color: '#1a1a1a' }}>Project Application Submitted!</h1>
    <p>Hi {applicantName},</p>
    <p>Thank you for applying to join "<strong>{projectTitle}</strong>" at Gannon CodeX!</p>
    <p>We have received your application and the project team will review it carefully. You can expect to hear back within 1-2 weeks.</p>
    <p>You can track the status of your application using your private tracking link below:</p>
    <p style={{ textAlign: 'center', margin: '2rem 0' }}>
      <a
        href={trackingUrl}
        style={{
          backgroundColor: '#00FFFF',
          color: '#0D0D0D',
          padding: '14px 24px',
          textDecoration: 'none',
          fontWeight: 'bold',
          border: '2px solid #0D0D0D',
          boxShadow: '4px 4px 0 #0D0D0D',
        }}
      >
        Track Your Application
      </a>
    </p>
    <p><strong>Please save this link, as it's the only way to access your application status page.</strong></p>
    
    <h2 style={{ color: '#1a1a1a', fontSize: '1.2rem' }}>What happens next?</h2>
    <ul>
      <li>The project team will review your application and experience</li>
      <li>If selected for an interview, you'll be contacted directly</li>
      <li>Successful applicants will be invited to join the project team</li>
      <li>You'll receive updates on your application status via this tracking system</li>
    </ul>

    <p>Thank you for your interest in collaborating with Gannon CodeX!</p>
    <p>— The Gannon CodeX Team</p>
    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' }} />
    <p style={{ fontSize: '0.8rem', color: '#888' }}>
      Application Tracking ID: {trackingId}<br />
      Project: {projectTitle}
    </p>
  </div>
);