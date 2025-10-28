import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './current-projects.module.css';
import { client } from '../../sanity/lib/client';
import { generateMetadata as createMetadata } from '@/lib/metadata';
import CurrentProjectsClient from './CurrentProjectsClient';

export const dynamic = 'force-dynamic';

export const metadata = createMetadata({
  title: 'Current Projects',
  description: 'Join ongoing projects at Gannon CodeX. Browse active projects seeking contributors and apply to join teams working on exciting tech initiatives.',
  keywords: ['Current Projects', 'Active Projects', 'Join Team', 'Apply', 'Contributors', 'Open Source'],
  url: '/current-projects'
});

async function getCurrentProjects() {
  const query = `*[_type == "projectProposal" && status in ["active-seeking", "active-progress"]] | order(presentationTime desc, projectName asc) {
    _id,
    "title": projectName,
    "slug": { "current": lower(replace(projectName, " ", "-")) },
    status,
    "shortDescription": description[0..200] + "...",
    "techStack": defined(techStack) => split(techStack, ","),
    skillsNeeded,
    difficultyLevel,
    timeline,
    timeCommitment,
    maxContributors,
    currentContributors[]->{
      name,
      _id
    },
    projectImage,
    proposerName,
    proposerEmail,
    trackingId
  }`;
  
  try {
    const projects = await client.fetch(query);
    return projects;
  } catch (error) {
    console.error("Failed to fetch current projects from Sanity:", error);
    return [];
  }
}

const CurrentProjectsPage = async () => {
  const projects = await getCurrentProjects();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Current Projects</h1>
            <p className={styles.subtitle}>
              Join ongoing projects and collaborate with fellow developers, designers, and innovators. 
              Find opportunities that match your skills and interests.
            </p>
          </div>
        </section>

        <CurrentProjectsClient projects={projects} />
      </main>
      <Footer />
    </>
  );
};

export default CurrentProjectsPage;