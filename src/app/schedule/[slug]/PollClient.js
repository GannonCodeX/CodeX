'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TimeGrid from './TimeGrid'
import ResponseForm from './ResponseForm'
import BestTimesDisplay, { getBestSlotIds } from './BestTimesDisplay'
import ExportActions from './ExportActions'
import styles from './poll.module.css'

export default function PollClient({ poll: initialPoll, pollId, slug, isExpired }) {
  const router = useRouter()
  const [poll, setPoll] = useState(initialPoll)
  const [activeTab, setActiveTab] = useState('respond')
  const [copied, setCopied] = useState(false)
  const gridRef = useRef(null)
  const [canDelete, setCanDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Check if current user can delete this poll (has the token in localStorage)
  useEffect(() => {
    const storedTokens = JSON.parse(localStorage.getItem('pollDeleteTokens') || '{}')
    if (storedTokens[pollId]) {
      setCanDelete(true)
    }
  }, [pollId])

  // Calculate best slots for highlighting
  const bestSlotIds = getBestSlotIds(poll.responses)

  const refreshPoll = useCallback(() => {
    router.refresh()
  }, [router])

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/schedule/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const storedTokens = JSON.parse(localStorage.getItem('pollDeleteTokens') || '{}')
      const deleteToken = storedTokens[pollId]

      const response = await fetch('/api/schedule/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, deleteToken }),
      })

      if (response.ok) {
        // Remove token from localStorage
        delete storedTokens[pollId]
        localStorage.setItem('pollDeleteTokens', JSON.stringify(storedTokens))
        // Redirect to schedule page
        router.push('/schedule')
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to delete poll')
      }
    } catch (error) {
      alert('Failed to delete poll. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className={styles.pollContent}>
      {/* Share Link */}
      <div className={styles.shareSection}>
        <span className={styles.shareLabel}>Share this poll:</span>
        <div className={styles.shareLink}>
          <input
            type="text"
            readOnly
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/schedule/${slug}`}
            className={styles.shareLinkInput}
          />
          <button onClick={handleCopyLink} className={styles.copyBtn}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        {canDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={styles.deleteBtn}
            title="Delete this poll"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.deleteModal}>
          <div className={styles.deleteModalContent}>
            <h3 className={styles.deleteModalTitle}>Delete Poll?</h3>
            <p className={styles.deleteModalText}>
              Are you sure you want to delete &quot;{poll.title}&quot;? This action cannot be undone.
            </p>
            <div className={styles.deleteModalActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.cancelBtn}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={styles.confirmDeleteBtn}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('respond')}
          className={`${styles.tab} ${activeTab === 'respond' ? styles.activeTab : ''}`}
        >
          Add Your Availability
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`${styles.tab} ${activeTab === 'results' ? styles.activeTab : ''}`}
        >
          View Results ({poll.responses?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'respond' && !isExpired ? (
        <ResponseForm poll={poll} onResponseSubmitted={refreshPoll} />
      ) : activeTab === 'respond' && isExpired ? (
        <div className={styles.expiredMessage}>
          <p>This poll is no longer accepting responses.</p>
          <button
            onClick={() => setActiveTab('results')}
            className={styles.viewResultsBtn}
          >
            View Results Instead
          </button>
        </div>
      ) : (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsHeaderTop}>
              <div>
                <h3 className={styles.resultsTitle}>Group Availability</h3>
                <p className={styles.resultsHint}>
                  Darker green = more people available. Hover to see names.
                </p>
              </div>
              {poll.responses?.length > 0 && (
                <ExportActions poll={poll} gridRef={gridRef} />
              )}
            </div>
          </div>

          <TimeGrid
            ref={gridRef}
            dates={poll.dates}
            startTime={poll.startTime}
            endTime={poll.endTime}
            timeSlotMinutes={poll.timeSlotMinutes}
            responses={poll.responses}
            selectedSlots={[]}
            onSlotsChange={() => {}}
            viewMode="view"
            bestSlotIds={bestSlotIds}
          />

          {poll.responses?.length > 0 && (
            <>
              <BestTimesDisplay
                responses={poll.responses}
                dates={poll.dates}
                timeSlotMinutes={poll.timeSlotMinutes}
              />

              <div className={styles.respondentsList}>
                <h4 className={styles.respondentsTitle}>Respondents</h4>
                <div className={styles.respondents}>
                  {poll.responses.map((response, index) => (
                    <div key={index} className={styles.respondent}>
                      <span className={styles.respondentName}>{response.name}</span>
                      <span className={styles.respondentSlots}>
                        {response.availability?.length || 0} slots
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {(!poll.responses || poll.responses.length === 0) && (
            <div className={styles.noResponses}>
              <p>No responses yet. Share the link to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
