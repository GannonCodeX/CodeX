import React from 'react';
import styles from './About.module.css';
import Link from 'next/link';

const About = () => {
  return (
    <section className={styles.about}>
      <h2 className={styles.heading}>// ABOUT US</h2>
      <div className={styles.content}>
        <p>
          Gannon Codex is a student-run organization at Gannon University dedicated to fostering a vibrant community of coders, designers, and tech enthusiasts.
        </p>
        <Link href="/about" className="button">
          Learn More About Us
        </Link>
      </div>
    </section>
  );
};

export default About;