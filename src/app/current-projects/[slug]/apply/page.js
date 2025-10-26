import React from 'react';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import styles from './apply.module.css';
import { client } from '../../../../sanity/lib/client';
import { generateMetadata as createMetadata } from '@/lib/metadata';
import ProjectApplicationForm from './ProjectApplicationForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const project = await getProject(params.slug);
  
  if (!project) {
    return createMetadata({
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
    });
  }

  return createMetadata({
    title: `Apply to ${project.title}`,
    description: `Apply to join the ${project.title} project at Gannon CodeX. ${project.shortDescription}`,
    keywords: ['Apply', 'Join Project', project.title, ...(project.techStack || [])],
    url: `/current-projects/${project.slug.current}/apply`
  });
}

async function getProject(slug) {
  const query = `*[_type == "activeProject" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    status,
    leadClub->{
      title,
      _id
    },
    projectManager->{
      name,
      email,
      _id
    },
    shortDescription,
    techStack,
    skillsNeeded,
    difficultyLevel,
    maxContributors,
    currentContributors[]->{
      _id
    },
    applicationDeadline
  }`;
  
  try {
    const project = await client.fetch(query, { slug });
    return project;
  } catch (error) {
    console.error("Failed to fetch project from Sanity:", error);
    return null;
  }
}

const ApplyPage = async ({ params }) => {
  const project = await getProject(params.slug);

  if (!project) {
    notFound();
  }

  const spotsLeft = Math.max(0, project.maxContributors - (project.currentContributors?.length || 0));
  const canApply = project.status === 'seeking-contributors' && spotsLeft > 0;

  // Check if application deadline has passed
  const isPastDeadline = project.applicationDeadline && 
    new Date(project.applicationDeadline) < new Date();

  if (!canApply || isPastDeadline) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.closedSection}>
              <h1 className={styles.title}>Applications Closed</h1>
              <p className={styles.message}>
                {isPastDeadline 
                  ? 'The application deadline for this project has passed.'
                  : spotsLeft === 0 
                    ? 'This project has reached its maximum number of contributors.'
                    : 'This project is no longer accepting applications.'
                }
              </p>
              <a href={`/current-projects/${project.slug.current}`} className={styles.backButton}>
                Back to Project
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Apply to {project.title}</h1>
            <p className={styles.subtitle}>
              Fill out the application below to join this project. 
              We'll review your application and get back to you within 1-2 weeks.
            </p>
          </div>

          <ProjectApplicationForm project={project} />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ApplyPage;