import React from 'react';
import styles from './HeroVectors.module.css';

const HeroVectors = () => {
  return (
    <div className={styles.vectorWrapper}>
      {/* Plus signs grid */}
      <svg className={`${styles.vector} ${styles.plusGrid}`} width="200" height="200" viewBox="0 0 100 100">
        <defs>
          <pattern id="plus" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M8 0 V16 M0 8 H16" stroke="var(--accent)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#plus)" />
      </svg>

      {/* Circle */}
      <svg className={`${styles.vector} ${styles.circle}`} width="150" height="150" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="var(--blush-purple)" strokeWidth="2" fill="none" />
      </svg>

      {/* Zigzag */}
      <svg className={`${styles.vector} ${styles.zigzag}`} width="100" height="50" viewBox="0 0 100 50">
        <path d="M0 25 L20 0 L40 50 L60 0 L80 50 L100 25" stroke="var(--code-green)" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
};

export default HeroVectors;
