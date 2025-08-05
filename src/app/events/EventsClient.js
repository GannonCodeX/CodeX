'use client';

import React, { useState } from 'react';
import EventCard from '@/app/components/EventCard';
import styles from './events.module.css';

const EventsClient = ({ initialEvents }) => {
  const [filter, setFilter] = useState('UPCOMING');

  // The events are passed from the server, no need for useEffect to fetch them.
  const filteredEvents = initialEvents.filter(event => event.status === filter);

  return (
    <>
      <div className={styles.filterContainer}>
        <button
          className={`${styles.filterButton} ${filter === 'UPCOMING' ? styles.active : ''}`}
          onClick={() => setFilter('UPCOMING')}
        >
          // Upcoming
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'PAST' ? styles.active : ''}`}
          onClick={() => setFilter('PAST')}
        >
          // Past
        </button>
      </div>

      <div className={styles.eventsGrid}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <EventCard key={index} event={event} />
          ))
        ) : (
          <p className={styles.noEvents}>No {filter.toLowerCase()} events to show right now. Check back soon!</p>
        )}
      </div>
    </>
  );
};

export default EventsClient;
