// app/projects/[slug]/apply/page.js
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ApplicationForm from './ApplicationForm'
import styles from './apply.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const project = await getProject(params.slug);
  
  if (!project) {
    return createMetadata({
      title: 'Application Not Found',
      description: 'The requested project application could not be found.',
      url: `/projects/${params.slug}/apply`
    });
  }

  return createMetadata({
    title: `Apply to ${project.title}`,
    description: `Join the ${project.title} project team. Apply now to contribute to this exciting project.`,
    keywords: ['Apply', 'Join Project', project.title, 'Collaboration', 'Team'],
    url: `/projects/${params.slug}/apply`
  });
}

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

async function getProject(slug) {
  const query = `*[_type == "project" && slug.current == $slug && status == "active-seeking"][0]{
    _id,
    title,
    mainImage,
    excerpt,
    description,
    status,
    proposerName,
    proposerEmail,
    techStack,
    skillsNeeded,
    difficultyLevel,
    timeCommitment,
    timeline,
    maxContributors,
    currentContributors[]->{name},
    applicationDeadline,
    customQuestions
  }`
  const project = await client.fetch(query, { slug })
  return project
}

export default async function ApplyPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const project = await getProject(params.slug)

  if (!project) {
    return (
      <>
        <Header />
        <main className={styles.wrapper}>
          <div className={styles.container}>
            <h1 className={styles.title}>Application Not Available</h1>
            <p>This project is not currently accepting applications or does not exist.</p>
            <Link href="/projects" className={styles.backLink}>← Back to Projects</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Check if applications are still open
  const spotsLeft = project.maxContributors - (project.currentContributors?.length || 0);
  const isPastDeadline = project.applicationDeadline && 
    new Date(project.applicationDeadline) < new Date();

  const applicationsOpen = spotsLeft > 0 && !isPastDeadline;

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <Link href={`/projects/${params.slug}`} className={styles.backLink}>
            ← Back to {project.title}
          </Link>
          
          <header className={styles.header}>
            <h1 className={styles.title}>Apply to Join</h1>
            <h2 className={styles.projectTitle}>{project.title}</h2>
            
            {project.mainImage && (
              <div className={styles.imageWrapper}>
                <Image
                  src={urlFor(project.mainImage).width(800).url()}
                  alt={project.title}
                  width={800}
                  height={400}
                  className={styles.projectImage}
                />
              </div>
            )}
          </header>

          <div className={styles.contentGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.infoBox}>
                <h3 className={styles.sidebarTitle}>// Project Info</h3>
                <div className={styles.projectDetails}>
                  <div className={styles.detail}>
                    <strong>Proposer:</strong> {project.proposerName}
                  </div>
                  {project.difficultyLevel && (
                    <div className={styles.detail}>
                      <strong>Difficulty:</strong> {project.difficultyLevel}
                    </div>
                  )}
                  {project.timeCommitment && (
                    <div className={styles.detail}>
                      <strong>Time Commitment:</strong> {project.timeCommitment} hours/week
                    </div>
                  )}
                  {project.timeline && (
                    <div className={styles.detail}>
                      <strong>Timeline:</strong> {project.timeline}
                    </div>
                  )}
                  <div className={styles.detail}>
                    <strong>Available Spots:</strong> {spotsLeft}/{project.maxContributors}
                  </div>
                  {project.applicationDeadline && (
                    <div className={styles.detail}>
                      <strong>Deadline:</strong> {new Date(project.applicationDeadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {project.techStack && (
                <div className={styles.infoBox}>
                  <h3 className={styles.sidebarTitle}>// Tech Stack</h3>
                  <div className={styles.techTags}>
                    {project.techStack.split(',').map((tech, i) => (
                      <span key={i} className={styles.techTag}>{tech.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {project.skillsNeeded && project.skillsNeeded.length > 0 && (
                <div className={styles.infoBox}>
                  <h3 className={styles.sidebarTitle}>// Skills Needed</h3>
                  <div className={styles.skillTags}>
                    {project.skillsNeeded.map((skill, i) => (
                      <span key={i} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <div className={styles.mainContent}>
              {!applicationsOpen ? (
                <div className={styles.closedNotice}>
                  <h3>Applications Closed</h3>
                  {spotsLeft <= 0 && <p>This project has reached its maximum number of contributors.</p>}
                  {isPastDeadline && <p>The application deadline has passed.</p>}
                  <Link href={`/projects/${params.slug}`} className={styles.button}>
                    View Project Details
                  </Link>
                </div>
              ) : (
                <>
                  <div className={styles.description}>
                    <h3>About This Project</h3>
                    <p>{project.excerpt}</p>
                  </div>
                  
                  <ApplicationForm 
                    project={project}
                    projectSlug={params.slug}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}