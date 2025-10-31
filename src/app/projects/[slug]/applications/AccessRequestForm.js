'use client';

import { useState } from 'react';
import styles from './applications.module.css';

const AccessRequestForm = ({ projectSlug, project }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/request-proposer-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          projectSlug,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail(''); // Clear form on success
      } else {
        setError(data.error || 'Failed to send access link');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authForm}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--mono)', color: 'var(--fg)', marginBottom: '1rem' }}>
          🔒 Secure Access Required
        </h3>
        <p>Enter your email to receive a secure access link for managing applications.</p>
      </div>
      
      {message ? (
        <div style={{ 
          background: 'rgba(40, 167, 69, 0.1)', 
          border: '1px solid #28a745',
          color: '#28a745',
          padding: '1.5rem',
          marginBottom: '2rem',
          fontFamily: 'var(--mono)'
        }}>
          ✅ {message}
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Check your email and click the secure link to access your applications dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.emailForm}>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address" 
            className={styles.emailInput}
            required 
            disabled={loading}
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Sending Secure Link...' : 'Send Secure Access Link'}
          </button>
        </form>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.note}>
        <p><strong>Security Features:</strong></p>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Secure cryptographic tokens (not guessable)</li>
          <li>Links expire in 2 hours automatically</li>
          <li>Email verification required</li>
          <li>Only the project proposer ({project.proposerEmail}) can access</li>
        </ul>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--subtle-gray)' }}>
          This ensures only authorized users can manage applications while keeping the system simple.
        </p>
      </div>
    </div>
  );
};

export default AccessRequestForm;