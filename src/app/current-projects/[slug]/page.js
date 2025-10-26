import React from 'react';
import { notFound } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PortableTextRenderer from '../../components/PortableTextRenderer';
import styles from './project-detail.module.css';
import { client } from '../../../sanity/lib/client';
import { generateMetadata as createMetadata } from '@/lib/metadata';
import ProjectDetailClient from './ProjectDetailClient';

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
    title: project.title,
    description: project.shortDescription || `Join the ${project.title} project at Gannon CodeX`,
    keywords: ['Current Project', project.title, ...(project.techStack || []), ...(project.skillsNeeded || [])],
    url: `/current-projects/${project.slug.current}`
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
      avatar,
      _id
    },
    description,
    shortDescription,
    techStack,
    skillsNeeded,
    difficultyLevel,
    timeline,
    timeCommitment,
    maxContributors,
    currentContributors[]->{
      name,
      avatar,
      _id
    },
    requirements,
    learningOpportunities,
    meetingSchedule,
    communicationChannel,
    repositoryUrl,
    projectImage,
    applicationDeadline,
    startDate,
    featured
  }`;
  
  try {
    const project = await client.fetch(query, { slug });
    return project;
  } catch (error) {
    console.error("Failed to fetch project from Sanity:", error);
    return null;
  }
}

const ProjectDetailPage = async ({ params }) => {
  const project = await getProject(params.slug);

  if (!project) {
    notFound();
  }

  const spotsLeft = Math.max(0, project.maxContributors - (project.currentContributors?.length || 0));
  const canApply = project.status === 'seeking-contributors' && spotsLeft > 0;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <ProjectDetailClient project={project} canApply={canApply} spotsLeft={spotsLeft} />
      </main>
      <Footer />
    </>
  );
};

export default ProjectDetailPage;