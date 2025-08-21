import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';
import Highlight from './Highlight';
import HeroVectors from './HeroVectors';

const Hero = () => {
  return (
    <main className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Welcome to the Gannon{' '}
          <Highlight type="underline" color="var(--accent)">
            Codex
          </Highlight>
          !
        </h1>
        <p className={styles.description}>
          GCX is a student-led{' '}
          <Highlight type="circle" color="var(--blush-purple)">
            community
          </Highlight>{' '}
          for technology, computer science, and design at Gannon University. We{' '}
          <Highlight type="underline" color="var(--code-green)">
            build
          </Highlight>
          , break, and learn together.
        </p>
        <div className={styles.ctaContainer}>
          <a
            href="https://engageu.gannon.edu/organization/guprogramming"
            target="_blank"
            rel="noopener noreferrer"
            className="button"
          >
            Join The Community
          </a>
          <a href="#events" className={styles.secondaryCta}>
            // See our events
          </a>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <HeroVectors />
        <Image
          src="/assets/images/Neo-brutalist Poster Aug 5 2025.png"
          alt="Gannon University Main Building in a neo-brutalist style"
          width={600}
          height={600}
          className={styles.heroImage}
          priority
        />
      </div>
    </main>
  );
};

export default Hero;
