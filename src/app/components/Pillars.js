import React from 'react';
import styles from './Pillars.module.css';

const pillars = [
  {
    title: 'Education',
    icon: '🎓',
    description: "The Education Pillar runs our peer-to-peer mentorship program, organizes student-led open source projects (Codex Labs), and puts together workshops and panels on recruitment, careers, and more.",
  },
  {
    title: 'DevFest',
    icon: '🎉',
    description: "The DevFest Pillar organizes Gannon's annual university-wide hackathon! Members coordinate with sponsors, organize workshops, build the schedule, create promotional materials, and build the DevFest website.",
  },
  {
    title: 'Media & Branding',
    icon: '🎨',
    description: "The Media Pillar manages graphic design, content creation, and publicity to engage with the Gannon community. We design and manage the Codex website, social media, and branding.",
  },
  {
    title: 'Community',
    icon: '❤️',
    description: "The Community Pillar organizes our annual Startup Career Fair, professor lunches, alumni dinners, and social events. They are the glue that holds our community together.",
  },
];

const Pillars = () => {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.heading}>// Our Foundations</h2>
      <div className={styles.grid}>
        {pillars.map((pillar, index) => (
          <div
            key={index}
            className={styles.pillarCard}
            style={{ '--i': index }}
          >
            <div className={styles.header}>
              <span className={styles.icon}>{pillar.icon}</span>
              <h3 className={styles.title}>{pillar.title}</h3>
            </div>
            <p className={styles.description}>{pillar.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pillars;
