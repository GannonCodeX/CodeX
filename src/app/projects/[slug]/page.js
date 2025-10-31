// app/projects/[slug]/page.js
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import PortableTextRenderer from '@/app/components/PortableTextRenderer'
import styles from './slug.module.css'
import { generateMetadata as createMetadata } from '@/lib/metadata'

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const project = await getProject(params.slug);
  
  if (!project) {
    return createMetadata({
      title: 'Project Not Found',
      description: 'The requested project could not be found.',
      url: `/projects/${params.slug}`
    });
  }

  return createMetadata({
    title: project.title,
    description: project.excerpt || `Explore ${project.title}, a project by ${project.leadClub?.title || 'Gannon CodeX'}.`,
    keywords: ['Project', project.title, project.leadClub?.title, 'Software Development', 'Portfolio'],
    image: project.mainImage ? imageUrlBuilder(client).image(project.mainImage).width(1200).height(630).url() : '/assets/images/2x Logo Header.png',
    url: `/projects/${params.slug}`,
    type: 'article'
  });
}

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

async function getProject(slug) {
  const query = `*[_type == "project" && slug.current == $slug][0]{
    title,
    mainImage,
    excerpt,
    status,
    description,
    projectLink,
    leadClub->{title, "slug": slug.current},
    collaborators[]->{title, "slug": slug.current},
    currentContributors[]->{name, avatar},
    proposerName,
    proposerEmail,
    techStack,
    skillsNeeded,
    difficultyLevel,
    timeCommitment,
    timeline,
    maxContributors,
    applicationDeadline,
    customQuestions,
    goals,
    estimatedBudget,
    fundingSource,
    budgetBreakdown,
    specialRequests,
    createdAt,
    trackingId
  }`
  const project = await client.fetch(query, { slug })
  return project
}


export default async function ProjectPage({ params: paramsPromise }) {
  const params = await paramsPromise; // Await the params promise
  const project = await getProject(params.slug)

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <article>
          <header className={styles.header}>
            <Link href="/projects" className={styles.backLink}>&larr; All Projects</Link>
            <h1 className={styles.title}>{project.title}</h1>
            {project.mainImage && (
              <div className={styles.imageWrapper}>
                <Image
                  src={urlFor(project.mainImage).width(1200).url()}
                  alt={project.title}
                  width={1200}
                  height={600}
                  className={styles.mainImage}
                />
              </div>
            )}
          </header>

          <div className={styles.contentGrid}>
            <aside className={styles.sidebar}>
              {/* Project Status */}
              <div className={styles.infoBox}>
                <h2 className={styles.sidebarTitle}>// Status</h2>
                <div className={`${styles.statusBadge} ${styles[project.status]}`}>
                  {project.status === 'active-seeking' && '🔍 Seeking Contributors'}
                  {project.status === 'active-progress' && '⚡ In Progress'}
                  {project.status === 'completed' && '✅ Completed'}
                  {project.status === 'proposed' && '📋 Proposed'}
                  {project.status === 'draft' && '📝 Draft'}
                </div>
              </div>

              {/* Project Details */}
              <div className={styles.infoBox}>
                <h2 className={styles.sidebarTitle}>// Details</h2>
                <div className={styles.detailsList}>
                  {project.proposerName && (
                    <div className={styles.detailItem}>
                      <strong>Proposer:</strong> {project.proposerName}
                    </div>
                  )}
                  {project.difficultyLevel && (
                    <div className={styles.detailItem}>
                      <strong>Difficulty:</strong> {project.difficultyLevel}
                    </div>
                  )}
                  {project.timeCommitment && (
                    <div className={styles.detailItem}>
                      <strong>Time Commitment:</strong> {project.timeCommitment} hours/week
                    </div>
                  )}
                  {project.timeline && (
                    <div className={styles.detailItem}>
                      <strong>Timeline:</strong> {project.timeline}
                    </div>
                  )}
                  {project.maxContributors && (
                    <div className={styles.detailItem}>
                      <strong>Max Contributors:</strong> {project.currentContributors?.length || 0}/{project.maxContributors}
                    </div>
                  )}
                </div>
              </div>

              {/* Tech Stack */}
              {project.techStack && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Tech Stack</h2>
                  <div className={styles.techTags}>
                    {project.techStack.split(',').map((tech, i) => (
                      <span key={i} className={styles.techTag}>{tech.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Needed */}
              {project.skillsNeeded && project.skillsNeeded.length > 0 && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Skills Needed</h2>
                  <div className={styles.skillTags}>
                    {project.skillsNeeded.map((skill, i) => (
                      <span key={i} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs */}
              {(project.leadClub || (project.collaborators && project.collaborators.length)) && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Clubs</h2>
                  <div className={styles.clubList}>
                    {project.leadClub && (
                      <a href={`/clubs/${project.leadClub.slug}`} className={styles.clubTag}>
                        {project.leadClub.title}
                      </a>
                    )}
                    {project.collaborators?.map((c, idx) => (
                      <a key={idx} href={`/clubs/${c.slug}`} className={styles.clubTag}>
                        {c.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Contributors */}
              {project.currentContributors && project.currentContributors.length > 0 && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Current Contributors</h2>
                  <ul className={styles.contributorsList}>
                    {project.currentContributors.map((contributor, index) => (
                      <li key={index} className={styles.contributor}>
                        {contributor.avatar ? (
                          <Image
                            src={urlFor(contributor.avatar).width(50).url()}
                            alt={contributor.name}
                            width={40}
                            height={40}
                            className={styles.contributorAvatar}
                          />
                        ) : (
                          <div className={styles.avatarPlaceholder}>👤</div>
                        )}
                        <span>{contributor.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                {project.status === 'active-seeking' && (
                  <Link href={`/projects/${params.slug}/apply`} className={styles.applyButton}>
                    Apply to Join
                  </Link>
                )}
                {project.projectLink && (
                  <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className={styles.projectLinkButton}>
                    View Project
                  </a>
                )}
                {project.proposerEmail && (
                  <Link href={`/projects/${params.slug}/applications`} className={styles.manageButton}>
                    Manage Applications (Proposer)
                  </Link>
                )}
              </div>
            </aside>

            <div className={styles.mainContent}>
              {project.description && (
                <div className={styles.description}>
                  <PortableTextRenderer content={project.description} />
                </div>
              )}
              
              {project.goals && (
                <div className={styles.section}>
                  <h2>Project Goals</h2>
                  <p>{project.goals}</p>
                </div>
              )}

              {project.budgetBreakdown && (
                <div className={styles.section}>
                  <h2>Budget Information</h2>
                  {project.estimatedBudget > 0 && (
                    <p><strong>Estimated Budget:</strong> ${project.estimatedBudget}</p>
                  )}
                  {project.fundingSource && (
                    <p><strong>Funding Source:</strong> {project.fundingSource}</p>
                  )}
                  <p><strong>Budget Breakdown:</strong></p>
                  <p>{project.budgetBreakdown}</p>
                </div>
              )}

              {project.specialRequests && (
                <div className={styles.section}>
                  <h2>Special Requests</h2>
                  <p>{project.specialRequests}</p>
                </div>
              )}

              {project.customQuestions && project.customQuestions.length > 0 && (
                <div className={styles.section}>
                  <h2>Application Questions</h2>
                  <ol>
                    {project.customQuestions.map((question, i) => (
                      <li key={i}>{question}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
