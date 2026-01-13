'use client'

import { useRef, useCallback } from 'react'
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

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

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function ExportActions({
  poll,
  gridRef,
}) {
  const exportingImage = useRef(false)

  const handleExportCSV = useCallback(() => {
    const { title, dates, startTime, endTime, timeSlotMinutes, responses } = poll
    const timeSlots = generateTimeSlots(startTime, endTime, timeSlotMinutes)

    // Build CSV data
    const rows = []
    rows.push(['Date', 'Time', 'Available Count', 'Available Names'])

    dates.forEach((date) => {
      timeSlots.forEach((time) => {
        const slotId = `${date}_${time}`
        const availableNames = responses
          ?.filter((r) => r.availability?.includes(slotId))
          .map((r) => r.name) || []

        rows.push([
          formatDate(date),
          formatTime(time),
          availableNames.length.toString(),
          availableNames.join('; '),
        ])
      })
    })

    // Convert to CSV string
    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma or quote
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              return `"${cell.replace(/"/g, '""')}"`
            }
            return cell
          })
          .join(',')
      )
      .join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizeFilename(title)}-availability.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [poll])

  const handleExportImage = useCallback(async () => {
    if (exportingImage.current || !gridRef?.current) return
    exportingImage.current = true

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      })

      // Convert to PNG and download
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = `${sanitizeFilename(poll.title)}-availability.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to export image:', error)
      alert('Failed to export image. Please try again.')
    } finally {
      exportingImage.current = false
    }
  }, [poll.title, gridRef])

  return (
    <div className={styles.exportActions}>
      <span className={styles.exportLabel}>Export:</span>
      <button
        onClick={handleExportCSV}
        className={styles.exportBtn}
        title="Download availability data as CSV"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        CSV
      </button>
      <button
        onClick={handleExportImage}
        className={styles.exportBtn}
        title="Download heatmap as PNG image"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        Image
      </button>
    </div>
  )
}
