'use client';

import React, { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import EventCard from '@/app/components/EventCard';
import styles from './events.module.css';

async function getEvents() {
  const query = `*[_type == "event"] | order(date desc){
    title,
    "slug": slug.current,
    date,
    location,
    description,
    status
  }`;
  const events = await client.fetch(query);
  return events;
}

const EventsPage = () => {
  const [filter, setFilter] = useState('UPCOMING');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const allEvents = await getEvents();
      setEvents(allEvents);
    }
    fetchData();
  }, []);

  const filteredEvents = events.filter(event => event.status === filter);

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Events & Workshops</h1>
          <p className={styles.subtitle}>
            Join us to learn, build, and connect. Here’s what’s happening at the Codex.
          </p>
        </div>

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
      </main>
      <Footer />
    </>
  );
};

export default EventsPage;
