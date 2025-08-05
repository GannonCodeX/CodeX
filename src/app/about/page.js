import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WavyMarquee from '../components/WavyMarquee';
import Pillars from '../components/Pillars';
import styles from './about.module.css';

export const metadata = {
  title: 'About Us | Gannon CodeX',
  description: 'Learn about the mission and values of Gannon CodeX. We are a collective of builders, thinkers, and innovators united by a passion for technology.',
};

const AboutPage = () => {
  return (
    <>
      <Header />
      <main>
        <div className={styles.aboutHeader}>
          <h1 className={styles.title}>Our Mission</h1>
          <p className={styles.subtitle}>
            We are a collective of builders, thinkers, and innovators united by a passion for technology. Our goal is to create a space where every student can learn, grow, and contribute to the tech landscape at Gannon and beyond.
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
