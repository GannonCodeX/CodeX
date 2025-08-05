'use client';

import React, { useState, useEffect } from 'react';
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';
import styles from './MembersMarquee.module.css';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

const placeholderMembers = [
  { name: 'Beatrice "B" Miller', role: 'VP & UI/UX Lead', avatar: 'https://placehold.co/300x200/A66FFF/FFFFFF?text=Bea' },
  { name: 'Charlie "Root" Davis', role: 'Backend Specialist', avatar: 'https://placehold.co/300x200/00FF88/0D0D0D?text=Charlie' },
  { name: 'Diana "D" Prince', role: 'Frontend Magician', avatar: 'https://placehold.co/300x200/FFFFFF/0D0D0D?text=Diana' },
  { name: 'Ethan "Byte" Hunt', role: 'Cybersec & Infra', avatar: 'https://placehold.co/300x200/0D0D0D/FFFFFF?text=Ethan' },
  { name: 'Fiona "Pixel" Gall', role: 'Design & Branding', avatar: 'https://placehold.co/300x200/FF69B4/0D0D0D?text=Fiona' },
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
    <img src={member.avatar} alt={member.name} className={styles.avatar} />
    <div className={styles.info}>
      <p className={styles.name}>{member.name}</p>
      <p className={styles.role}>{member.role}</p>
    </div>
  </div>
);

const MembersMarquee = () => {
  // Initialize state with placeholders to ensure content on first render
  const [members, setMembers] = useState(placeholderMembers);

  useEffect(() => {
    async function fetchData() {
      const sanityMembers = await getMembers();
      const formattedMembers = sanityMembers.map(member => ({
        ...member,
        avatar: urlFor(member.avatar).width(300).height(200).url(),
      }));
      // Prepend real members to the start of the list
      setMembers([...formattedMembers, ...placeholderMembers]);
    }
    fetchData();
  }, []);

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