// app/projects/page.js
import { client } from '@/sanity/lib/client'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import styles from './projects.module.css'
import ProjectsClient from './ProjectsClient'
export const dynamic = 'force-dynamic';
export const revalidate = 0;


import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Projects',
  description: 'Browse a collection of innovative projects built by the Gannon CodeX community. From web apps to open-source tools, see what our members are creating.',
  keywords: ['Projects', 'Portfolio', 'Web Development', 'Software Engineering', 'Open Source', 'Innovation'],
  url: '/projects'
});

async function getAllProjects() {
  // Get all projects from the unified project schema
  const projectsQuery = `*[_type == "project"] | order(createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    mainImage,
    excerpt,
    status,
    leadClub->{title, "slug": slug.current},
    collaborators[]->{title, "slug": slug.current},
    techStack,
    maxContributors,
    currentContributors[]->{name, _id},
    proposerName,
    skillsNeeded,
    difficultyLevel,
    timeline,
    timeCommitment,
    createdAt
  }`;

  try {
    const projects = await client.fetch(projectsQuery);
    console.log("Fetched projects:", projects);
    return projects;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Projects - Gannon CodeX</h1>
          <p className={styles.subtitle}>
            Explore active projects you can join and completed projects from our community. 
            Find opportunities to contribute or see what we've built together.
          </p>
        </header>
        <ProjectsClient projects={projects} />
      </main>
      <Footer />
    </>
  )
}
