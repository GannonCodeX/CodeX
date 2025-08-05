'use client';

import React, { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image'; // Import next/image
import styles from './MembersMarquee.module.css';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

// This can be kept for a fallback state
const placeholderMembers = [
  { name: 'Beatrice "B" Miller', role: 'VP & UI/UX Lead', avatar: 'https://placehold.co/300/A66FFF/FFFFFF?text=Bea' },
  { name: 'Charlie "Root" Davis', role: 'Backend Specialist', avatar: 'https://placehold.co/300/00FF88/0D0D0D?text=Charlie' },
  { name: 'Diana "D" Prince', role: 'Frontend Magician', avatar: 'https://placehold.co/300/FFFFFF/0D0D0D?text=Diana' },
];

async function getMembers() {
  const query = `*[_type == "member"]{
    name,
    role,
    avatar
  }`;
  const members = await client.fetch(query);
  return members;
}

const MemberCard = ({ member }) => (
  <div className={styles.card}>
    {/* Use next/image for optimization */}
    <Image
      src={member.avatar}
      // Improved alt text for accessibility
      alt={`Avatar of ${member.name}`}
      width={150} // Set a fixed size for avatars
      height={150}
      className={styles.avatar}
    />
    <div className={styles.info}>
      <p className={styles.name}>{member.name}</p>
      <p className={styles.role}>{member.role}</p>
    </div>
  </div>
);

const MembersMarquee = () => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const sanityMembers = await getMembers();
        if (sanityMembers && sanityMembers.length > 0) {
          const formattedMembers = sanityMembers.map(member => ({
            ...member,
            avatar: urlFor(member.avatar).width(300).height(300).url(),
          }));
          setMembers(formattedMembers);
        } else {
          // Only use placeholders if Sanity returns no members
          setMembers(placeholderMembers);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
        // Fallback to placeholders on error
        setMembers(placeholderMembers);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Show a loading state or nothing until members are ready
  if (isLoading) {
    return <div className={styles.wrapper}><p>Loading members...</p></div>;
  }

  // Duplicate members for a seamless loop
  const extendedMembers = [...members, ...members];

  return (
    <section className={styles.wrapper}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {extendedMembers.map((member, index) => (
            <MemberCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembersMarquee;