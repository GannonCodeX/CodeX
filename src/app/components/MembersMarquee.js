'use client';

import React from 'react';
import Image from 'next/image';
import styles from './MembersMarquee.module.css';

const MemberCard = ({ member }) => (
  <div className={styles.card}>
    <Image
      src={member.avatar}
      alt={`Avatar of ${member.name}`}
      width={180}
      height={180}
      className={styles.avatar}
    />
    <div className={styles.info}>
      <p className={styles.name}>{member.name}</p>
      <p className={styles.role}>{member.role}</p>
      {member.affiliations?.length ? (
        <div className={styles.affiliations}>
          {member.affiliations.map((a, i) => (
            <span key={i} className={styles.affiliationTag}>
              {(a.clubShort || a.clubTitle) || 'Club'}
              {a.clubRole ? ` — ${a.clubRole}` : ''}
              {a.isEboard ? ' • E-Board' : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonAvatar}></div>
    <div className={styles.info}>
      <div className={styles.skeletonText}></div>
      <div className={`${styles.skeletonText} ${styles.short}`}></div>
    </div>
  </div>
);

const MembersMarquee = ({ initialMembers }) => {
  const members = initialMembers;

  if (members.length === 0) {
    return null;
  }

  const extendedMembers = [...members, ...members];

  return (
    <section className={styles.wrapper}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {extendedMembers.map((member, index) => (
            <MemberCard key={`${member.name}-${index}`} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembersMarquee;
