'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './new.module.css'

const TIME_OPTIONS = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, '0')
    const minute = m.toString().padStart(2, '0')
    TIME_OPTIONS.push(`${hour}:${minute}`)
  }
}

export default function PollForm({ clubs }) {
  const router = useRouter()
  const [status, setStatus] = useState({ loading: false, error: null })
  const [selectedDates, setSelectedDates] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    createdBy: '',
    createdByEmail: '',
    clubId: '',
    startTime: '09:00',
    endTime: '21:00',
    timeSlotMinutes: 30,
    visibility: 'public',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateClick = (dateStr) => {
    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) {
        return prev.filter((d) => d !== dateStr)
      }
      return [...prev, dateStr].sort()
    })
  }

  const generateCalendarDays = () => {
    const today = new Date()
    const days = []
    for (let i = 0; i < 28; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }

  const calendarDays = generateCalendarDays()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: null })

    if (!formData.title.trim()) {
      setStatus({ loading: false, error: 'Please enter a poll title' })
      return
    }

    if (!formData.createdBy.trim()) {
      setStatus({ loading: false, error: 'Please enter your name' })
      return
    }

    if (selectedDates.length === 0) {
      setStatus({ loading: false, error: 'Please select at least one date' })
      return
    }

    try {
      const response = await fetch('/api/schedule/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dates: selectedDates,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create poll')
      }

      // Store delete token in localStorage so creator can delete later
      if (result.deleteToken) {
        const storedTokens = JSON.parse(localStorage.getItem('pollDeleteTokens') || '{}')
        storedTokens[result.id] = result.deleteToken
        localStorage.setItem('pollDeleteTokens', JSON.stringify(storedTokens))
      }

      router.push(`/schedule/${result.slug}`)
    } catch (error) {
      setStatus({ loading: false, error: error.message })
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Poll Details</h2>

        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Poll Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={styles.input}
            placeholder="e.g., Weekly Team Meeting"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={styles.textarea}
            placeholder="Optional details about this poll..."
            rows={3}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="createdBy" className={styles.label}>
              Your Name *
            </label>
            <input
              type="text"
              id="createdBy"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="John Doe"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="createdByEmail" className={styles.label}>
              Your Email
            </label>
            <input
              type="email"
              id="createdByEmail"
              name="createdByEmail"
              value={formData.createdByEmail}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="clubId" className={styles.label}>
            Associated Club
          </label>
          <select
            id="clubId"
            name="clubId"
            value={formData.clubId}
            onChange={handleInputChange}
            className={styles.input}
          >
            <option value="">None (General)</option>
            {clubs?.map((club) => (
              <option key={club._id} value={club._id}>
                {club.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Visibility</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={handleInputChange}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>
                <strong>Public</strong> - Listed on /schedule page
              </span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="visibility"
                value="unlisted"
                checked={formData.visibility === 'unlisted'}
                onChange={handleInputChange}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>
                <strong>Unlisted</strong> - Only accessible via direct link (for eboard/private)
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Select Dates *</h2>
        <p className={styles.helpText}>Click on dates to include them in your poll</p>

        <div className={styles.calendarGrid}>
          {calendarDays.map((date) => {
            const dateStr = date.toISOString().split('T')[0]
            const isSelected = selectedDates.includes(dateStr)
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleDateClick(dateStr)}
                className={`${styles.calendarDay} ${isSelected ? styles.selected : ''} ${isWeekend ? styles.weekend : ''} ${isToday ? styles.today : ''}`}
              >
                <span className={styles.dayName}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={styles.dayNumber}>{date.getDate()}</span>
                <span className={styles.monthName}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </button>
            )
          })}
        </div>

        {selectedDates.length > 0 && (
          <div className={styles.selectedDates}>
            <span className={styles.selectedCount}>
              {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedDates([])}
              className={styles.clearBtn}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Time Settings</h2>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="startTime" className={styles.label}>
              Start Time
            </label>
            <select
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className={styles.input}
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endTime" className={styles.label}>
              End Time
            </label>
            <select
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className={styles.input}
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="timeSlotMinutes" className={styles.label}>
              Slot Duration
            </label>
            <select
              id="timeSlotMinutes"
              name="timeSlotMinutes"
              value={formData.timeSlotMinutes}
              onChange={handleInputChange}
              className={styles.input}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.submitSection}>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status.loading}
        >
          {status.loading ? 'Creating...' : 'Create Poll'}
        </button>
        {status.error && <p className={styles.error}>{status.error}</p>}
      </div>
    </form>
  )
}
