'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './calendar.module.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatEventTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const CalendarClient = ({ events, clubs }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedClub, setSelectedClub] = useState('all');

  // Filter events by club
  const filteredEvents = useMemo(() => {
    if (selectedClub === 'all') return events;
    return events.filter(event =>
      event.leadClub?.slug === selectedClub ||
      event.coHosts?.some(coHost => coHost.slug === selectedClub)
    );
  }, [events, selectedClub]);

  // Group events by date for easy lookup
  const eventsByDate = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach(event => {
      if (!event.date) return;
      const dateKey = new Date(event.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Get events for the selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toDateString();
    return eventsByDate[dateKey] || [];
  }, [selectedDate, eventsByDate]);

  // Navigate months
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);

  // Build calendar cells
  const calendarDays = [];

  // Days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(currentYear, currentMonth - 1, day);
    calendarDays.push({ day, date, isCurrentMonth: false, isPrevMonth: true });
  }

  // Days in current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    calendarDays.push({ day, date, isCurrentMonth: true });
  }

  // Days from next month to fill the grid
  const remainingCells = 42 - calendarDays.length; // 6 rows x 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(currentYear, currentMonth + 1, day);
    calendarDays.push({ day, date, isCurrentMonth: false, isNextMonth: true });
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const getEventsForDay = (date) => {
    const dateKey = date.toDateString();
    return eventsByDate[dateKey] || [];
  };

  return (
    <div className={styles.calendarWrapper}>
      {/* Filter and Navigation */}
      <div className={styles.controls}>
        <div className={styles.clubFilter}>
          <label htmlFor="clubFilter" className={styles.filterLabel}>Filter by Club:</label>
          <select
            id="clubFilter"
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Clubs</option>
            {clubs.map(club => (
              <option key={club._id} value={club.slug}>
                {club.shortName || club.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.navigation}>
          <button onClick={goToPrevMonth} className={styles.navButton} aria-label="Previous month">
            &larr;
          </button>
          <h2 className={styles.monthYear}>
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button onClick={goToNextMonth} className={styles.navButton} aria-label="Next month">
            &rarr;
          </button>
          <button onClick={goToToday} className={styles.todayButton}>
            Today
          </button>
        </div>
      </div>

      <div className={styles.calendarLayout}>
        {/* Calendar Grid */}
        <div className={styles.calendarGrid}>
          {/* Weekday Headers */}
          <div className={styles.weekdayHeader}>
            {WEEKDAYS.map(day => (
              <div key={day} className={styles.weekday}>{day}</div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className={styles.daysGrid}>
            {calendarDays.map(({ day, date, isCurrentMonth }, index) => {
              const dayEvents = getEventsForDay(date);
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={index}
                  className={`${styles.dayCell} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday(date) ? styles.today : ''} ${isSelected(date) ? styles.selected : ''} ${hasEvents ? styles.hasEvents : ''}`}
                  onClick={() => setSelectedDate(date)}
                  aria-label={`${date.toDateString()}${hasEvents ? `, ${dayEvents.length} event(s)` : ''}`}
                >
                  <span className={styles.dayNumber}>{day}</span>
                  {hasEvents && (
                    <div className={styles.eventIndicators}>
                      {dayEvents.length > 3 ? (
                        <span className={styles.eventBadge}>{dayEvents.length}</span>
                      ) : (
                        dayEvents.slice(0, 3).map((event, i) => (
                          <span key={i} className={styles.eventDot} />
                        ))
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>
              {selectedDate ? formatFullDate(selectedDate) : 'Select a Date'}
            </h3>
          </div>

          <div className={styles.eventsList}>
            {!selectedDate ? (
              <p className={styles.noSelection}>Click on a day to see events</p>
            ) : selectedDateEvents.length === 0 ? (
              <p className={styles.noEvents}>No events on this day</p>
            ) : (
              selectedDateEvents.map(event => (
                <Link
                  key={event._id}
                  href={`/events/${event.slug}`}
                  className={styles.eventCard}
                >
                  <div className={styles.eventTime}>
                    {formatEventTime(event.date)}
                  </div>
                  <div className={styles.eventDetails}>
                    <h4 className={styles.eventTitle}>{event.title}</h4>
                    {event.location && (
                      <p className={styles.eventLocation}>{event.location}</p>
                    )}
                    {event.leadClub && (
                      <span className={styles.eventClub}>
                        {event.leadClub.shortName || event.leadClub.title || 'Unknown Club'}
                      </span>
                    )}
                  </div>
                  <span className={styles.eventArrow}>&rarr;</span>
                </Link>
              ))
            )}
          </div>

          <Link href="/events" className={styles.backLink}>
            &larr; Back to Events List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CalendarClient;
