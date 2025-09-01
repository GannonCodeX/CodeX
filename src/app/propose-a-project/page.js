import React from 'react';
import styles from './propose.module.css';
import ProposeProjectVectors from '../components/ProposeProjectVectors';
import ProposeProjectForm from './ProposeProjectForm'; // Import the new form component
import { client } from '../../sanity/lib/client';

export const metadata = {
  title: 'Propose a Project | Gannon CodeX',
  description: 'Have a project idea? Propose it to the Gannon CodeX community. We are always looking for new and exciting projects to work on.',
};

// Fetch members from Sanity, including avatar
async function getMembers() {
  const query = `*[_type == "member"] | order(name asc) {
    _id,
    name,
    avatar
  }`;
  try {
    const members = await client.fetch(query);
    return members;
  } catch (error) {
    console.error("Failed to fetch members from Sanity:", error);
    return [];
  }
}

const ProposeProjectPage = async () => {
  const members = await getMembers();

  return (
    <div className={styles.wrapper}>
      <ProposeProjectVectors />
      <header className={styles.header}>
        <h1 className={styles.title}>Propose a Project</h1>
        <p className={styles.subtitle}>Got an idea? Let&apos;s build it together.</p>
      </header>
      <main className={styles.formContainer}>
        <ProposeProjectForm members={members} />
      </main>
    </div>
  );
};

export default ProposeProjectPage;
