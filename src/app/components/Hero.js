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
          Gannon University's Premier{' '}
          <Highlight type="underline" color="var(--accent)">
            Coding Community
          </Highlight>
        </h1>
        <p className={styles.description}>
          Join Gannon CodeX, the leading{' '}
          <Highlight type="circle" color="var(--blush-purple)">
            student organization
          </Highlight>{' '}
          for computer science, software development, and technology innovation at Gannon University. We{' '}
          <Highlight type="underline" color="var(--code-green)">
            build projects
          </Highlight>
          , host workshops, and connect aspiring developers in Erie, PA.
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
          <a href="/events" className={styles.secondaryCta}>
            // Explore Events & Workshops
          </a>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <HeroVectors />
        <Image
          src="/assets/images/Neo-brutalist Poster Aug 5 2025.png"
          alt="Gannon University coding community - students learning programming and software development in Erie PA"
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
