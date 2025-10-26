import { client } from '@/sanity/lib/client';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import EventsClient from './EventsClient'; // Import the new client component
import styles from './events.module.css';
import { unstable_noStore as noStore } from 'next/cache';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Metadata can stay here because this is now a Server Component
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Events',
  description: 'Explore upcoming and past events, workshops, and hackathons hosted by Gannon CodeX. Join us to learn, build, and connect with the tech community.',
  keywords: ['Events', 'Workshops', 'Hackathons', 'Tech Events', 'Networking', 'Learning'],
  url: '/events'
});

// Data fetching happens on the server
async function getEvents() {
  noStore();
  const query = `*[_type == "event"] | order(date desc){
    title,
    "slug": slug.current,
    date,
    location,
    description,
    status,
    leadClub->{title, "slug": slug.current},
    coHosts[]->{title, "slug": slug.current}
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
          <h1 className={styles.title}>Tech Events & Programming Workshops at Gannon University</h1>
          <p className={styles.subtitle}>
            Discover upcoming coding workshops, hackathons, tech talks, and networking events hosted by Gannon CodeX in Erie, Pennsylvania. Join our community of student developers and enhance your programming skills through hands-on learning experiences.
          </p>
        </div>

        {/* Render the client component with server-fetched data */}
        <EventsClient initialEvents={events} />

      </main>
      <Footer />
    </>
  );
};

