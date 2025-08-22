import { client } from '@/sanity/lib/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import EventsClient from './EventsClient'; // Import the new client component
import styles from './events.module.css';
import { unstable_noStore as noStore } from 'next/cache';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Metadata can stay here because this is now a Server Component
export const metadata = {
  title: 'Events | Gannon CodeX',
  description: 'Explore upcoming and past events, workshops, and hackathons hosted by Gannon CodeX. Join us to learn, build, and connect with the tech community.',
};

// Data fetching happens on the server
async function getEvents() {
  noStore();
  const query = `*[_type == "event"] | order(date desc){
    title,
    "slug": slug.current,
    date,
    location,
    description,
    status
  }`;
  const events = await client.fetch(query); // Revalidate every 60 seconds
  return events;
}

// The page is now an async Server Component
export default async function EventsPage() {
  noStore();
  const events = await getEvents();

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

        {/* Render the client component with server-fetched data */}
        <EventsClient initialEvents={events} />

      </main>
      <Footer />
    </>
  );
};

