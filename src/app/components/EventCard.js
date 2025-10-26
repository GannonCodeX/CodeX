import React from 'react';
import Link from 'next/link';
import styles from './EventCard.module.css';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`${styles.card} ${event.status === 'PAST' ? styles.past : ''}`}>
      <div className={styles.header}>
        <span className={styles.status}>{event.status}</span>
        <h2 className={styles.title}>{event.title}</h2>
      </div>
      <div className={styles.details}>
        <p><strong>Date:</strong> {eventDate}</p>
        <p><strong>Location:</strong> {event.location}</p>
      </div>
      {(event.leadClub || (event.coHosts && event.coHosts.length)) && (
        <div className={styles.clubsRow}>
          {event.leadClub && (
            <a href={`/clubs/${event.leadClub.slug}`} className={styles.clubTag}>
              {event.leadClub.title}
            </a>
          )}
          {event.coHosts?.map((c, idx) => (
            <a key={idx} href={`/clubs/${c.slug}`} className={styles.clubTag}>
              {c.title}
            </a>
          ))}
        </div>
      )}
      <p className={styles.description}>{event.description}</p>
      <Link href={`/events/${event.slug}`} className={styles.button}>
        Learn More
      </Link>
    </div>
  );
};

export default EventCard;
