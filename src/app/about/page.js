import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WavyMarquee from '../components/WavyMarquee';
import Pillars from '../components/Pillars';
import styles from './about.module.css';
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'About Us',
  description: 'Learn about the mission and values of Gannon CodeX. We are a collective of builders, thinkers, and innovators united by a passion for technology at Gannon University.',
  keywords: ['About Gannon CodeX', 'Mission', 'Values', 'Student Organization', 'Tech Community', 'Innovation'],
  url: '/about'
});

const AboutPage = () => {
  return (
    <>
      <Header />
      <main>
        <div className={styles.aboutHeader}>
          <h1 className={styles.title}>About Gannon CodeX - Erie's Premier Student Tech Organization</h1>
          <p className={styles.subtitle}>
            Gannon CodeX is Gannon University's leading computer science and technology student organization in Erie, Pennsylvania. We're a collaborative community of software developers, designers, and tech innovators building the future through hands-on programming projects, coding workshops, and industry networking events. Our mission is to empower every student with the skills and connections needed to succeed in the technology industry.
          </p>
        </div>
        <WavyMarquee />
        <Pillars />
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
