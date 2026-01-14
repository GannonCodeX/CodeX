// src/app/events/calendar/page.js
import { client } from '@/sanity/lib/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import CalendarClient from './CalendarClient';
import styles from './calendar.module.css';
import { unstable_noStore as noStore } from 'next/cache';
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = createMetadata({
  title: 'Event Calendar',
  description: 'View all Gannon CodeX events in a monthly calendar format. Browse upcoming workshops, hackathons, and tech events at Gannon University.',
  keywords: ['Event Calendar', 'Monthly Events', 'Tech Calendar', 'Upcoming Events', 'Schedule'],
  url: '/events/calendar'
});

async function getEvents() {
  noStore();
  const query = `*[_type == "event"] | order(date asc) {
    _id,
    title,
    "slug": slug.current,
    date,
    location,
    status,
    "leadClub": leadClub->{title, shortName, "slug": slug.current},
    "coHosts": coHosts[]->{title, shortName, "slug": slug.current}
  }`;
  const events = await client.fetch(query);
  return events;
}

async function getClubs() {
  noStore();
  const query = `*[_type == "club"] | order(title asc) {
    _id,
    title,
    shortName,
    "slug": slug.current
  }`;
  const clubs = await client.fetch(query);
  return clubs;
}

export default async function CalendarPage() {
  noStore();
  const [events, clubs] = await Promise.all([getEvents(), getClubs()]);

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>// Event Calendar</h1>
            <p className={styles.subtitle}>
              Browse all CodeX events in calendar view. Click on a day to see event details.
            </p>
          </div>
          <CalendarClient events={events} clubs={clubs} />
        </div>
      </main>
      <Footer />
    </>
  );
}
