// src/app/components/emails/ConfirmationEmail.js
import React from 'react';

export const ConfirmationEmail = ({ proposerName, projectName, trackingId, trackingUrl }) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <h1 style={{ color: '#1a1a1a' }}>Project Proposal Submitted!</h1>
    <p>Hi {proposerName},</p>
    <p>Thank you for submitting your project proposal, "<strong>{projectName}</strong>", to the Gannon CodeX board.</p>
    <p>We have received your submission and will be reviewing it shortly. You can track the status of your proposal and see any feedback from the board using your private link below.</p>
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
        Track Your Proposal
      </a>
    </p>
    <p><strong>Please save this link, as it's the only way to access your proposal's status page.</strong></p>
    <p>We appreciate you taking the time to contribute to the club!</p>
    <p>— The Gannon CodeX Team</p>
    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' }} />
    <p style={{ fontSize: '0.8rem', color: '#888' }}>
      Tracking ID: {trackingId}
    </p>
  </div>
);
