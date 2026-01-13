'use client'

import { useState, useCallback, useRef } from 'react'
import styles from './poll.module.css'

function generateTimeSlots(startTime, endTime, slotMinutes) {
  const slots = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  let currentHour = startHour
  let currentMin = startMin

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
    slots.push(timeStr)

    currentMin += slotMinutes
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60)
      currentMin = currentMin % 60
    }
  }

  return slots
}

function formatTime(timeStr) {
  const [hour, min] = timeStr.split(':').map(Number)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${min.toString().padStart(2, '0')} ${ampm}`
}

export default function TimeGrid({
  dates,
  startTime,
  endTime,
  timeSlotMinutes,
  responses,
  selectedSlots,
  onSlotsChange,
  viewMode = 'edit', // 'edit' or 'view'
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null) // 'select' or 'deselect'
  const gridRef = useRef(null)

  const timeSlots = generateTimeSlots(startTime, endTime, timeSlotMinutes)

  // Calculate availability counts for heatmap
  const availabilityCounts = {}
  responses?.forEach((response) => {
    response.availability?.forEach((slotId) => {
      availabilityCounts[slotId] = (availabilityCounts[slotId] || 0) + 1
    })
  })
  const maxCount = Math.max(...Object.values(availabilityCounts), 1)

  const getSlotId = (date, time) => `${date}_${time}`

  const handleMouseDown = useCallback(
    (date, time) => {
      if (viewMode !== 'edit') return

      const slotId = getSlotId(date, time)
      const isSelected = selectedSlots.includes(slotId)

      setIsDragging(true)
      setDragMode(isSelected ? 'deselect' : 'select')

      if (isSelected) {
        onSlotsChange(selectedSlots.filter((id) => id !== slotId))
      } else {
        onSlotsChange([...selectedSlots, slotId])
      }
    },
    [viewMode, selectedSlots, onSlotsChange]
  )

  const handleMouseEnter = useCallback(
    (date, time) => {
      if (!isDragging || viewMode !== 'edit') return

      const slotId = getSlotId(date, time)
      const isSelected = selectedSlots.includes(slotId)

      if (dragMode === 'select' && !isSelected) {
        onSlotsChange([...selectedSlots, slotId])
      } else if (dragMode === 'deselect' && isSelected) {
        onSlotsChange(selectedSlots.filter((id) => id !== slotId))
      }
    },
    [isDragging, dragMode, viewMode, selectedSlots, onSlotsChange]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragMode(null)
  }, [])

  // Get who's available for a slot
  const getAvailableNames = (slotId) => {
    return responses
      ?.filter((r) => r.availability?.includes(slotId))
      .map((r) => r.name) || []
  }

  return (
    <div
      ref={gridRef}
      className={styles.gridContainer}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `80px repeat(${dates.length}, 1fr)`,
        }}
      >
        {/* Header row with dates */}
        <div className={styles.cornerCell}></div>
        {dates.map((date) => {
          const d = new Date(date + 'T00:00:00')
          return (
            <div key={date} className={styles.dateHeader}>
              <span className={styles.dayName}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className={styles.dateNumber}>
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )
        })}

        {/* Time rows */}
        {timeSlots.map((time) => (
          <>
            <div key={`time-${time}`} className={styles.timeLabel}>
              {formatTime(time)}
            </div>
            {dates.map((date) => {
              const slotId = getSlotId(date, time)
              const isSelected = selectedSlots.includes(slotId)
              const count = availabilityCounts[slotId] || 0
              const availableNames = getAvailableNames(slotId)
              const intensity = count / maxCount

              return (
                <div
                  key={slotId}
                  className={`${styles.cell} ${isSelected ? styles.selected : ''} ${viewMode === 'view' ? styles.viewMode : ''}`}
                  style={
                    viewMode === 'view' && count > 0
                      ? {
                          backgroundColor: `rgba(76, 175, 80, ${0.2 + intensity * 0.6})`,
                        }
                      : undefined
                  }
                  onMouseDown={() => handleMouseDown(date, time)}
                  onMouseEnter={() => handleMouseEnter(date, time)}
                  title={
                    viewMode === 'view' && count > 0
                      ? `${count} available: ${availableNames.join(', ')}`
                      : undefined
                  }
                >
                  {viewMode === 'view' && count > 0 && (
                    <span className={styles.countBadge}>{count}</span>
                  )}
                </div>
              )
            })}
          </>
        ))}
      </div>

      {viewMode === 'edit' && (
        <p className={styles.dragHint}>
          Click and drag to select your available times
        </p>
      )}
    </div>
  )
}
