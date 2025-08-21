'use client';

import React, { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import styles from './MembersMarquee.module.css';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

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

const MembersMarquee = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const sanityMembers = await client.fetch(`*[_type == "member"]{ name, role, avatar }`);
        if (sanityMembers && sanityMembers.length > 0) {
          const formattedMembers = sanityMembers.map(member => ({
            ...member,
            avatar: urlFor(member.avatar).width(300).height(300).url(),
          }));
          setMembers(formattedMembers);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.marquee}>
          <div className={styles.marqueeContent} style={{ animation: 'none' }}>
            {/* Render a static set of skeleton cards */}
            {[...Array(5)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render the component if there are no members to show
  if (members.length === 0) {
    return null;
  }

  // Duplicate members for a seamless loop
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