'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import TimeGrid from './TimeGrid'
import ResponseForm from './ResponseForm'
import BestTimesDisplay, { getBestSlotIds } from './BestTimesDisplay'
import ExportActions from './ExportActions'
import styles from './poll.module.css'

export default function PollClient({ poll: initialPoll, slug, isExpired }) {
  const router = useRouter()
  const [poll, setPoll] = useState(initialPoll)
  const [activeTab, setActiveTab] = useState('respond')
  const [copied, setCopied] = useState(false)
  const gridRef = useRef(null)

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
      </div>

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
