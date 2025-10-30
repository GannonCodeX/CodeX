// app/projects/[slug]/applications/page.js
import { client } from '@/sanity/lib/client'
import { redirect } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ApplicationsManager from './ApplicationsManager'
import styles from './applications.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: paramsPromise, searchParams }) {
  const params = await paramsPromise;
  const project = await getProject(params.slug);
  
  return createMetadata({
    title: project ? `Manage Applications - ${project.title}` : 'Project Applications',
    description: 'Review and manage project applications.',
    url: `/projects/${params.slug}/applications`
  });
}

async function getProject(slug) {
  const query = `*[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    proposerEmail,
    status,
    maxContributors,
    currentContributors[]->{name, _id}
  }`
  const project = await client.fetch(query, { slug })
  return project
}

async function getApplications(projectId) {
  const query = `*[_type == "projectApplication" && project._ref == $projectId] | order(applicationDate desc) {
    _id,
    trackingId,
    status,
    applicantName,
    applicantEmail,
    applicantPhone,
    skillLevel,
    relevantSkills,
    experience,
    motivation,
    availability,
    portfolioLinks,
    applicationDate,
    reviewNotes,
    reviewDate
  }`
  const applications = await client.fetch(query, { projectId })
  return applications
}

export default async function ApplicationsPage({ params: paramsPromise, searchParams }) {
  const params = await paramsPromise;
  const project = await getProject(params.slug);
  
  if (!project) {
    redirect('/projects');
  }

  // Simple email verification for proposer access
  const proposerEmail = searchParams.email;
  const isAuthorized = proposerEmail === project.proposerEmail;

  if (!isAuthorized) {
    return (
      <>
        <Header />
        <main className={styles.wrapper}>
          <div className={styles.container}>
            <h1 className={styles.title}>Access Restricted</h1>
            <div className={styles.authForm}>
              <p>Enter your email to access applications for this project:</p>
              <form method="GET" className={styles.emailForm}>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Your email address" 
                  className={styles.emailInput}
                  required 
                />
                <button type="submit" className={styles.submitButton}>
                  Access Applications
                </button>
              </form>
              <p className={styles.note}>
                Only the project proposer ({project.proposerEmail}) can access applications.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const applications = await getApplications(project._id);

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Applications for {project.title}</h1>
              <p className={styles.subtitle}>
                {applications.length} total applications • 
                {project.currentContributors?.length || 0}/{project.maxContributors} contributors
              </p>
            </div>
            <a 
              href={`/projects/${params.slug}`} 
              className={styles.backLink}
            >
              ← Back to Project
            </a>
          </div>

          <ApplicationsManager 
            applications={applications}
            project={project}
            projectSlug={params.slug}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}