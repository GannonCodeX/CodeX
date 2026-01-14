'use client'

import { useState } from 'react'
import TimeGrid from './TimeGrid'
import styles from './poll.module.css'

export default function ResponseForm({ poll, onResponseSubmitted }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedSlots, setSelectedSlots] = useState([])
  const [status, setStatus] = useState({ loading: false, error: null, success: false })
  const [isEditing, setIsEditing] = useState(true)

  // Check if user already responded
  const existingResponse = poll.responses?.find(
    (r) => r.name.toLowerCase() === name.trim().toLowerCase()
  )

  const handleNameBlur = () => {
    if (existingResponse) {
      setSelectedSlots(existingResponse.availability || [])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: null, success: false })

    if (!name.trim()) {
      setStatus({ loading: false, error: 'Please enter your name', success: false })
      return
    }

    try {
      const response = await fetch('/api/schedule/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId: poll._id,
          name: name.trim(),
          email: email.trim() || null,
          availability: selectedSlots,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit response')
      }

      setStatus({ loading: false, error: null, success: true })
      setIsEditing(false)

      // Notify parent to refresh data
      if (onResponseSubmitted) {
        onResponseSubmitted()
      }
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false })
    }
  }

  if (status.success && !isEditing) {
    return (
      <div className={styles.successMessage}>
        <h3>Response Submitted!</h3>
        <p>Your availability has been recorded. You can update it anytime by entering your name again.</p>
        <button
          onClick={() => {
            setIsEditing(true)
            setStatus({ loading: false, error: null, success: false })
          }}
          className={styles.editBtn}
        >
          Edit Response
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.responseForm}>
      <div className={styles.nameSection}>
        <div className={styles.inputGroup}>
          <label htmlFor="responderName" className={styles.label}>
            Your Name *
          </label>
          <input
            type="text"
            id="responderName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            className={styles.input}
            placeholder="Enter your name"
            required
          />
          {existingResponse && (
            <span className={styles.existingHint}>
              Updating existing response
            </span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="responderEmail" className={styles.label}>
            Email (optional)
          </label>
          <input
            type="email"
            id="responderEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className={styles.gridSection}>
        <h3 className={styles.gridTitle}>Select Your Availability</h3>
        <TimeGrid
          dates={poll.dates}
          startTime={poll.startTime}
          endTime={poll.endTime}
          timeSlotMinutes={poll.timeSlotMinutes}
          responses={poll.responses}
          selectedSlots={selectedSlots}
          onSlotsChange={setSelectedSlots}
          viewMode="edit"
        />
      </div>

      <div className={styles.submitSection}>
        <div className={styles.slotCount}>
          {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected
        </div>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status.loading}
        >
          {status.loading ? 'Submitting...' : existingResponse ? 'Update Response' : 'Submit Response'}
        </button>
        {status.error && <p className={styles.error}>{status.error}</p>}
      </div>
    </form>
  )
}
