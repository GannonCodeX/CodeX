'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './officer.module.css'

export default function OfficerSelector({ clubs }) {
  const router = useRouter()
  const [selectedClub, setSelectedClub] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedClub) {
      setError('Please select a club')
      return
    }

    if (!email) {
      setError('Please enter your email')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/officer/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setEmail('')
      } else {
        setError(data.error || 'Failed to send access link')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClubChange = (e) => {
    setSelectedClub(e.target.value)
    setError('')
    setSuccess('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>// Officer Dashboard</h1>
          <p className={styles.subtitle}>
            Select your club and enter your registered email to receive a magic link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="club" className={styles.label}>Select Club</label>
            <select
              id="club"
              value={selectedClub}
              onChange={handleClubChange}
              className={styles.select}
              disabled={isLoading}
            >
              <option value="">Choose a club...</option>
              {clubs.map((club) => (
                <option key={club._id} value={club.slug}>
                  {club.title} {club.shortName ? `(${club.shortName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Officer Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="your.email@example.com"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className={styles.error}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {success}
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || !selectedClub}
          >
            {isLoading ? 'Sending...' : 'Request Access Link'}
          </button>
        </form>

        <p className={styles.note}>
          Only registered officers can access the dashboard. Contact your club admin if you need access.
        </p>
      </div>
    </div>
  )
}
