import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import MembersSection from './components/MembersSection'; // Import the new Server Component
import WhatWeDo from './components/WhatWeDo';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

export const metadata = createMetadata({
  title: 'Home',
  description: 'Welcome to Gannon CodeX, the heart of coding culture at Gannon University. Discover our projects, events, and how to join our community of innovators.',
  keywords: ['Home', 'Welcome', 'Coding Culture', 'Innovation', 'Community', 'Join Us'],
  url: '/'
});

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <MembersSection /> {/* Render the new Server Component */}
        <WhatWeDo />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}