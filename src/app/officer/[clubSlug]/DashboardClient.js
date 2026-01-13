'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './dashboard.module.css'

export default function DashboardClient({ club, session, sessionError, dashboardData, categories }) {
  const router = useRouter()
  const [view, setView] = useState('overview')
  const [isAuthenticated, setIsAuthenticated] = useState(!!session)
  const [officerData, setOfficerData] = useState(session)
  const [stats, setStats] = useState(dashboardData?.stats || null)
  const [activity, setActivity] = useState(dashboardData?.activity || [])

  // Login form state
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState(sessionError || '')
  const [loginSuccess, setLoginSuccess] = useState('')

  // Modal states
  const [activeModal, setActiveModal] = useState(null) // 'announcement' | 'poll' | 'resource' | null
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' })

  // Announcement form
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    content: '',
    type: 'news',
    pinned: false
  })

  // Poll form
  const [pollData, setPollData] = useState({
    title: '',
    description: '',
    dates: [],
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    visibility: 'unlisted'
  })
  const [newDate, setNewDate] = useState('')

  // Resource form
  const [resourceData, setResourceData] = useState({
    title: '',
    description: '',
    resourceType: 'link',
    url: '',
    categoryId: ''
  })

  // Store session token in cookie when coming from magic link
  useEffect(() => {
    if (session?.fromMagicLink && session?.sessionToken) {
      document.cookie = `officer_session=${session.sessionToken}; path=/; max-age=${8 * 60 * 60}; samesite=strict`
      router.replace(`/officer/${club.slug}`, { scroll: false })
    }
  }, [session, club.slug, router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')
    setLoginSuccess('')

    try {
      const response = await fetch('/api/officer/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      })

      const data = await response.json()

      if (response.ok) {
        setLoginSuccess(data.message)
        setEmail('')
      } else {
        setLoginError(data.error || 'Failed to send access link')
      }
    } catch (error) {
      setLoginError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    document.cookie = 'officer_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setIsAuthenticated(false)
    setOfficerData(null)
    router.refresh()
  }

  const closeModal = () => {
    setActiveModal(null)
    setActionMessage({ type: '', text: '' })
    setAnnouncementData({ title: '', content: '', type: 'news', pinned: false })
    setPollData({
      title: '',
      description: '',
      dates: [],
      timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      visibility: 'unlisted'
    })
    setResourceData({ title: '', description: '', resourceType: 'link', url: '', categoryId: '' })
  }

  // Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setActionMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/officer/create-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      })

      const data = await response.json()

      if (response.ok) {
        setActionMessage({ type: 'success', text: 'Announcement created successfully!' })
        setTimeout(() => {
          closeModal()
          router.refresh()
        }, 1500)
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to create announcement' })
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Create Poll
  const handleCreatePoll = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setActionMessage({ type: '', text: '' })

    if (pollData.dates.length === 0) {
      setActionMessage({ type: 'error', text: 'Please add at least one date' })
      setActionLoading(false)
      return
    }

    try {
      const response = await fetch('/api/officer/create-poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData)
      })

      const data = await response.json()

      if (response.ok) {
        setActionMessage({ type: 'success', text: 'Poll created successfully!' })
        // Store delete token
        if (data.poll?.deleteToken) {
          const storedTokens = JSON.parse(localStorage.getItem('pollDeleteTokens') || '{}')
          storedTokens[data.poll.id] = data.poll.deleteToken
          localStorage.setItem('pollDeleteTokens', JSON.stringify(storedTokens))
        }
        setTimeout(() => {
          closeModal()
          router.push(`/schedule/${data.poll.slug}`)
        }, 1500)
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to create poll' })
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setActionLoading(false)
    }
  }

  // Create Resource
  const handleCreateResource = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setActionMessage({ type: '', text: '' })

    try {
      const response = await fetch('/api/officer/create-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      })

      const data = await response.json()

      if (response.ok) {
        setActionMessage({ type: 'success', text: 'Resource created successfully!' })
        setTimeout(() => {
          closeModal()
          router.refresh()
        }, 1500)
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to create resource' })
      }
    } catch (error) {
      setActionMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setActionLoading(false)
    }
  }

  const addDate = () => {
    if (newDate && !pollData.dates.includes(newDate)) {
      setPollData({ ...pollData, dates: [...pollData.dates, newDate].sort() })
      setNewDate('')
    }
  }

  const removeDate = (dateToRemove) => {
    setPollData({ ...pollData, dates: pollData.dates.filter(d => d !== dateToRemove) })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'announcement':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        )
      case 'event':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      case 'availabilityPoll':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        )
    }
  }

  const getRoleBadge = (role) => {
    if (!role) return 'Officer'
    return role.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Login Form View
  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <div className={styles.loginHeader}>
            <h1 className={styles.loginTitle}>// Officer Dashboard</h1>
            <p className={styles.loginClubName}>{club.title}</p>
          </div>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Officer Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                placeholder="your.email@example.com"
                required
                disabled={isLoading}
              />
            </div>

            {loginError && (
              <div className={styles.errorMessage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {loginError}
              </div>
            )}

            {loginSuccess && (
              <div className={styles.successMessage}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {loginSuccess}
              </div>
            )}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Request Access Link'}
            </button>
          </form>

          <p className={styles.loginNote}>
            Enter your registered officer email to receive a magic link.
          </p>
        </div>
      </div>
    )
  }

  // Dashboard View
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <Link href={`/clubs/${club.slug}`} className={styles.backLink}>
            &larr; Back to Club
          </Link>
          <h1 className={styles.dashboardTitle}>// Officer Dashboard</h1>
          <p className={styles.clubName}>{club.title}</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.officerInfo}>
            <span className={styles.officerEmail}>{officerData?.officer?.email}</span>
            <span className={styles.roleBadge}>{getRoleBadge(officerData?.officer?.role)}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${view === 'overview' ? styles.tabActive : ''}`}
          onClick={() => setView('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tabButton} ${view === 'actions' ? styles.tabActive : ''}`}
          onClick={() => setView('actions')}
        >
          Quick Actions
        </button>
        <button
          className={`${styles.tabButton} ${view === 'activity' ? styles.tabActive : ''}`}
          onClick={() => setView('activity')}
        >
          Activity
        </button>
      </nav>

      {/* Overview View */}
      {view === 'overview' && (
        <div className={styles.overviewGrid}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stats?.memberCount || 0}</span>
                <span className={styles.statLabel}>Members</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stats?.upcomingEvents?.length || 0}</span>
                <span className={styles.statLabel}>Upcoming Events</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stats?.recentAnnouncements?.length || 0}</span>
                <span className={styles.statLabel}>Announcements</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stats?.resourceCount || 0}</span>
                <span className={styles.statLabel}>Resources</span>
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>// Upcoming Events</h2>
            {stats?.upcomingEvents?.length > 0 ? (
              <ul className={styles.eventsList}>
                {stats.upcomingEvents.map((event) => (
                  <li key={event._id} className={styles.eventItem}>
                    <div className={styles.eventDate}>
                      <span className={styles.eventDay}>{new Date(event.date).getDate()}</span>
                      <span className={styles.eventMonth}>{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div className={styles.eventDetails}>
                      <Link href={`/events/${event.slug}`} className={styles.eventTitle}>
                        {event.title}
                      </Link>
                      <span className={styles.eventMeta}>
                        {formatTime(event.date)} - {event.location || 'TBD'}
                      </span>
                    </div>
                    <span className={`${styles.eventStatus} ${styles[`status${event.status}`]}`}>
                      {event.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No upcoming events scheduled.</p>
            )}
          </div>

          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>// Recent Announcements</h2>
            {stats?.recentAnnouncements?.length > 0 ? (
              <ul className={styles.announcementsList}>
                {stats.recentAnnouncements.map((announcement) => (
                  <li key={announcement._id} className={styles.announcementItem}>
                    <div className={styles.announcementContent}>
                      <span className={styles.announcementTitle}>
                        {announcement.pinned && <span className={styles.pinnedIcon}>*</span>}
                        {announcement.title}
                      </span>
                      <span className={styles.announcementMeta}>
                        {formatDate(announcement.publishedAt)} - {announcement.type}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No announcements yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions View */}
      {view === 'actions' && (
        <div className={styles.actionsGrid}>
          <div className={styles.actionCard} onClick={() => setActiveModal('announcement')}>
            <div className={styles.actionIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h3 className={styles.actionTitle}>Create Announcement</h3>
            <p className={styles.actionDescription}>Post a new update for your club members</p>
          </div>

          <div className={styles.actionCard} onClick={() => setActiveModal('poll')}>
            <div className={styles.actionIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className={styles.actionTitle}>Schedule Meeting</h3>
            <p className={styles.actionDescription}>Create an availability poll for members</p>
          </div>

          <div className={styles.actionCard} onClick={() => setActiveModal('resource')}>
            <div className={styles.actionIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className={styles.actionTitle}>Add Resource</h3>
            <p className={styles.actionDescription}>Add links or documents for members</p>
          </div>

          <Link href="/admin" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" />
                <line x1="10" y1="16" x2="14" y2="16" />
              </svg>
            </div>
            <h3 className={styles.actionTitle}>Create Event</h3>
            <p className={styles.actionDescription}>Full event editor in Sanity Studio</p>
          </Link>
        </div>
      )}

      {/* Activity View */}
      {view === 'activity' && (
        <div className={styles.activitySection}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>// Recent Activity</h2>
            {activity?.length > 0 ? (
              <ul className={styles.activityList}>
                {activity.map((item) => (
                  <li key={item._id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {getActivityIcon(item._type)}
                    </div>
                    <div className={styles.activityContent}>
                      <span className={styles.activityTitle}>{item.title}</span>
                      <span className={styles.activityMeta}>
                        {item._type === 'announcement' && `Announcement - ${item.type}`}
                        {item._type === 'event' && `Event - ${formatDate(item.date)}`}
                        {item._type === 'availabilityPoll' && `Poll by ${item.createdBy}`}
                      </span>
                    </div>
                    <span className={styles.activityDate}>
                      {formatDate(item._createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No recent activity.</p>
            )}
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {activeModal === 'announcement' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Announcement</h2>
              <button className={styles.modalClose} onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="announcement-title" className={styles.formLabel}>Title *</label>
                <input
                  type="text"
                  id="announcement-title"
                  value={announcementData.title}
                  onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                  className={styles.formInput}
                  placeholder="Announcement title..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="announcement-type" className={styles.formLabel}>Type</label>
                <select
                  id="announcement-type"
                  value={announcementData.type}
                  onChange={(e) => setAnnouncementData({ ...announcementData, type: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="news">News</option>
                  <option value="update">Update</option>
                  <option value="alert">Alert</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="announcement-content" className={styles.formLabel}>Content *</label>
                <textarea
                  id="announcement-content"
                  value={announcementData.content}
                  onChange={(e) => setAnnouncementData({ ...announcementData, content: e.target.value })}
                  className={styles.formTextarea}
                  placeholder="Write your announcement..."
                  rows={5}
                  required
                />
              </div>

              <div className={styles.formGroupInline}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={announcementData.pinned}
                    onChange={(e) => setAnnouncementData({ ...announcementData, pinned: e.target.checked })}
                  />
                  Pin this announcement
                </label>
              </div>

              {actionMessage.text && (
                <div className={actionMessage.type === 'error' ? styles.errorMessage : styles.successMessage}>
                  {actionMessage.text}
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Poll Modal */}
      {activeModal === 'poll' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Schedule Meeting</h2>
              <button className={styles.modalClose} onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleCreatePoll} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="poll-title" className={styles.formLabel}>Title *</label>
                <input
                  type="text"
                  id="poll-title"
                  value={pollData.title}
                  onChange={(e) => setPollData({ ...pollData, title: e.target.value })}
                  className={styles.formInput}
                  placeholder="e.g., Weekly Meeting Time"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="poll-description" className={styles.formLabel}>Description</label>
                <textarea
                  id="poll-description"
                  value={pollData.description}
                  onChange={(e) => setPollData({ ...pollData, description: e.target.value })}
                  className={styles.formTextarea}
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Dates *</label>
                <div className={styles.dateInputGroup}>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={styles.formInput}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <button type="button" onClick={addDate} className={styles.addButton}>
                    Add Date
                  </button>
                </div>
                {pollData.dates.length > 0 && (
                  <div className={styles.dateChips}>
                    {pollData.dates.map(date => (
                      <span key={date} className={styles.dateChip}>
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <button type="button" onClick={() => removeDate(date)} className={styles.removeChip}>
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="poll-visibility" className={styles.formLabel}>Visibility</label>
                <select
                  id="poll-visibility"
                  value={pollData.visibility}
                  onChange={(e) => setPollData({ ...pollData, visibility: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="unlisted">Unlisted - Only accessible via link</option>
                  <option value="public">Public - Listed on /schedule</option>
                </select>
              </div>

              {actionMessage.text && (
                <div className={actionMessage.type === 'error' ? styles.errorMessage : styles.successMessage}>
                  {actionMessage.text}
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {activeModal === 'resource' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Resource</h2>
              <button className={styles.modalClose} onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleCreateResource} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="resource-title" className={styles.formLabel}>Title *</label>
                <input
                  type="text"
                  id="resource-title"
                  value={resourceData.title}
                  onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })}
                  className={styles.formInput}
                  placeholder="Resource title..."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="resource-description" className={styles.formLabel}>Description</label>
                <textarea
                  id="resource-description"
                  value={resourceData.description}
                  onChange={(e) => setResourceData({ ...resourceData, description: e.target.value })}
                  className={styles.formTextarea}
                  placeholder="What is this resource about?"
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="resource-type" className={styles.formLabel}>Type</label>
                <select
                  id="resource-type"
                  value={resourceData.resourceType}
                  onChange={(e) => setResourceData({ ...resourceData, resourceType: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="link">Link</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="resource-url" className={styles.formLabel}>URL *</label>
                <input
                  type="url"
                  id="resource-url"
                  value={resourceData.url}
                  onChange={(e) => setResourceData({ ...resourceData, url: e.target.value })}
                  className={styles.formInput}
                  placeholder="https://..."
                  required
                />
              </div>

              {categories && categories.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="resource-category" className={styles.formLabel}>Category</label>
                  <select
                    id="resource-category"
                    value={resourceData.categoryId}
                    onChange={(e) => setResourceData({ ...resourceData, categoryId: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="">No category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionMessage.text && (
                <div className={actionMessage.type === 'error' ? styles.errorMessage : styles.successMessage}>
                  {actionMessage.text}
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
