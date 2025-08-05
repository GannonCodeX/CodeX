import React from 'react';
import styles from './WavyMarquee.module.css';

const words = [
  'Community', '~~', 'Programming', '~~', 'Development', '~~', 'Design', '~~', 'Innovation', '~~', 'Learning', '~~', 'Collaboration', '~~', 'Technology', '~~'
];

const extendedWords = [...words, ...words, ...words, ...words];

const WavyMarquee = () => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {extendedWords.map((word, index) => (
            <span key={index} className={styles.word}>
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WavyMarquee;
