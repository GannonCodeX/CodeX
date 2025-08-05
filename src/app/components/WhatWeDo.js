// app/components/WhatWeDo.js
import React from 'react';
import Link from 'next/link';
import styles from './WhatWeDo.module.css';

const activities = [
  {
    icon: '🛠️',
    title: 'Workshops & Talks',
  },
  {
    icon: '🚀',
    title: 'Collaborative Projects',
  },
  {
    icon: '🤝',
    title: 'Community & Networking',
  },
  {
    icon: '🏆',
    title: 'Hackathons & Competitions',
  },
];

const WhatWeDo = () => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.heading}>// WHAT WE DO</h2>
        <p className={styles.subheading}>
          We are a hands-on community focused on building practical skills. From weekly workshops to semester-long projects, there's always something to learn and create.
        </p>
      </div>
      <div className={styles.grid}>
        {activities.map((activity, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.icon}>{activity.icon}</div>
            <h3 className={styles.title}>{activity.title}</h3>
          </div>
        ))}
      </div>
      <div className={styles.ctaContainer}>
        <Link href="/events" className="button">
          See All Events
        </Link>
      </div>
    </section>
  );
};

export default WhatWeDo;