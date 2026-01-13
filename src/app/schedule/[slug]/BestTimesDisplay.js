'use client'

import styles from './poll.module.css'

function formatTime(timeStr) {
  const [hour, min] = timeStr.split(':').map(Number)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function getEndTime(startTime, slotMinutes) {
  const [hour, min] = startTime.split(':').map(Number)
  let endMin = min + slotMinutes
  let endHour = hour
  if (endMin >= 60) {
    endHour += Math.floor(endMin / 60)
    endMin = endMin % 60
  }
  return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
}

export function analyzeBestTimes(responses, dates, timeSlotMinutes, limit = 10) {
  if (!responses || responses.length === 0) {
    return []
  }

  // Count availability per slot
  const slotCounts = {}
  const slotNames = {}

  responses.forEach((response) => {
    response.availability?.forEach((slotId) => {
      slotCounts[slotId] = (slotCounts[slotId] || 0) + 1
      if (!slotNames[slotId]) {
        slotNames[slotId] = []
      }
      slotNames[slotId].push(response.name)
    })
  })

  // Convert to array and sort by count descending
  const sortedSlots = Object.entries(slotCounts)
    .map(([slotId, count]) => {
      const [date, time] = slotId.split('_')
      return {
        slotId,
        date,
        time,
        endTime: getEndTime(time, timeSlotMinutes),
        count,
        names: slotNames[slotId] || [],
        totalResponses: responses.length,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  return sortedSlots
}

export function getBestSlotIds(responses, threshold = 0.8) {
  if (!responses || responses.length === 0) {
    return new Set()
  }

  const slotCounts = {}
  responses.forEach((response) => {
    response.availability?.forEach((slotId) => {
      slotCounts[slotId] = (slotCounts[slotId] || 0) + 1
    })
  })

  const maxCount = Math.max(...Object.values(slotCounts))
  const thresholdCount = Math.ceil(maxCount * threshold)

  const bestSlots = new Set()
  Object.entries(slotCounts).forEach(([slotId, count]) => {
    if (count >= thresholdCount && count > 1) {
      bestSlots.add(slotId)
    }
  })

  return bestSlots
}

export default function BestTimesDisplay({ responses, dates, timeSlotMinutes }) {
  const bestTimes = analyzeBestTimes(responses, dates, timeSlotMinutes, 10)

  if (bestTimes.length === 0) {
    return null
  }

  return (
    <div className={styles.bestTimesSection}>
      <h4 className={styles.bestTimesTitle}>Best Times to Meet</h4>
      <p className={styles.bestTimesHint}>
        Time slots with the most availability
      </p>
      <div className={styles.bestTimesList}>
        {bestTimes.map((slot, index) => (
          <div
            key={slot.slotId}
            className={`${styles.bestTimeItem} ${index < 3 ? styles.topThree : ''}`}
          >
            <div className={styles.bestTimeRank}>
              {index + 1}
            </div>
            <div className={styles.bestTimeInfo}>
              <div className={styles.bestTimeDate}>
                {formatDate(slot.date)}
              </div>
              <div className={styles.bestTimeSlot}>
                {formatTime(slot.time)} - {formatTime(slot.endTime)}
              </div>
            </div>
            <div className={styles.bestTimeCount}>
              <span className={styles.countNumber}>{slot.count}</span>
              <span className={styles.countTotal}>/{slot.totalResponses}</span>
              <span className={styles.countLabel}>available</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
