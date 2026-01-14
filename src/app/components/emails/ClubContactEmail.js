// src/app/components/emails/ClubContactEmail.js
import React from 'react';

export const ClubContactEmail = ({ senderName, senderEmail, subject, message, clubName }) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <h1 style={{ color: '#1a1a1a' }}>New Contact Message for {clubName}</h1>
    <p>You have received a new message through the CodeX website contact form.</p>

    <div style={{
      backgroundColor: '#f9f9f9',
      border: '2px solid #0D0D0D',
      padding: '16px',
      margin: '1.5rem 0',
      boxShadow: '4px 4px 0 #0D0D0D'
    }}>
      <p style={{ margin: '0 0 8px' }}><strong>From:</strong> {senderName}</p>
      <p style={{ margin: '0 0 8px' }}><strong>Email:</strong> <a href={`mailto:${senderEmail}`}>{senderEmail}</a></p>
      <p style={{ margin: '0' }}><strong>Subject:</strong> {subject}</p>
    </div>

    <h2 style={{ color: '#1a1a1a', fontSize: '1.1rem' }}>Message:</h2>
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      padding: '16px',
      whiteSpace: 'pre-wrap'
    }}>
      {message}
    </div>

    <p style={{ textAlign: 'center', margin: '2rem 0' }}>
      <a
        href={`mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject)}`}
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
        Reply to {senderName}
      </a>
    </p>

    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '2rem 0' }} />
    <p style={{ fontSize: '0.8rem', color: '#888' }}>
      This message was sent via the Gannon CodeX website contact form.
    </p>
  </div>
);
