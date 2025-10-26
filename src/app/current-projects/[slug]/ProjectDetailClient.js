'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '../../../sanity/lib/image';
import PortableTextRenderer from '../../components/PortableTextRenderer';
import styles from './project-detail.module.css';

const ProjectDetailClient = ({ project, canApply, spotsLeft }) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const formatDifficulty = (difficulty) => {
    const difficultyMap = {
      'beginner': 'Beginner Friendly',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced',
      'mixed': 'Mixed Levels'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const formatStatus = (status) => {
    const statusMap = {
      'seeking-contributors': 'Open to Join',
      'in-progress': 'In Progress',
      'full': 'Team Full',
      'on-hold': 'On Hold',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={styles.container}>
      <Link href="/current-projects" className={styles.backLink}>
        ← Back to Current Projects
      </Link>

      <div className={`${styles.projectHeader} ${project.featured ? styles.featured : ''}`}>
        {project.featured && (
          <div className={styles.featuredBadge}>Featured Project</div>
        )}

        <div className={styles.projectImage}>
          {project.projectImage ? (
            <Image
              src={urlFor(project.projectImage).width(800).height(300).url()}
              alt={project.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <span>No Image Available</span>
          )}
        </div>

        <div className={styles.projectContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.subtitle}>{project.shortDescription}</p>
          </div>

          <div className={styles.metaSection}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <span className={`${styles.metaValue} ${styles.status}`}>
                {formatStatus(project.status)}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Difficulty</span>
              <span className={`${styles.metaValue} ${styles.difficulty}`}>
                {formatDifficulty(project.difficultyLevel)}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Timeline</span>
              <span className={styles.metaValue}>{project.timeline}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Time Commitment</span>
              <span className={styles.metaValue}>{project.timeCommitment}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Start Date</span>
              <span className={styles.metaValue}>{formatDate(project.startDate)}</span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Lead Club</span>
              <span className={styles.metaValue}>{project.leadClub?.title}</span>
            </div>

            {project.techStack && project.techStack.length > 0 && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tech Stack</span>
                <div className={styles.techList}>
                  {project.techStack.map((tech, index) => (
                    <span key={index} className={styles.techItem}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.skillsNeeded && project.skillsNeeded.length > 0 && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Skills Needed</span>
                <div className={styles.skillsList}>
                  {project.skillsNeeded.map((skill, index) => (
                    <span key={index} className={styles.skillItem}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.meetingSchedule && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Meetings</span>
                <span className={styles.metaValue}>{project.meetingSchedule}</span>
              </div>
            )}

            {project.communicationChannel && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Communication</span>
                <span className={styles.metaValue}>{project.communicationChannel}</span>
              </div>
            )}

            {project.repositoryUrl && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Repository</span>
                <a 
                  href={project.repositoryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.metaValue}
                  style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                >
                  View on GitHub
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.contentColumn}>
          {project.description && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Project Description</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.description}>
                  <PortableTextRenderer content={project.description} />
                </div>
              </div>
            </div>
          )}

          {project.requirements && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Requirements & Prerequisites</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.description}>
                  <PortableTextRenderer content={project.requirements} />
                </div>
              </div>
            </div>
          )}

          {project.learningOpportunities && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>What You'll Learn</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.description}>
                  <PortableTextRenderer content={project.learningOpportunities} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.sidebarColumn}>
          {/* Team Section */}
          <div className={styles.teamSection}>
            <div className={styles.teamHeader}>
              <h2 className={styles.teamTitle}>Team</h2>
              <span className={styles.teamCount}>
                {project.currentContributors?.length || 0} / {project.maxContributors}
              </span>
            </div>
            <div className={styles.teamContent}>
              {/* Project Manager */}
              {project.projectManager && (
                <div className={styles.projectManager}>
                  <div className={styles.managerLabel}>Project Manager</div>
                  <div className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {project.projectManager.avatar ? (
                        <Image
                          src={urlFor(project.projectManager.avatar).width(50).height(50).url()}
                          alt={project.projectManager.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        getInitials(project.projectManager.name)
                      )}
                    </div>
                    <div className={styles.memberInfo}>
                      <h4 className={styles.memberName}>{project.projectManager.name}</h4>
                      <p className={styles.memberRole}>Project Lead</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Contributors */}
              {project.currentContributors && project.currentContributors.length > 0 && (
                <div className={styles.contributors}>
                  <div className={styles.managerLabel}>Contributors</div>
                  {project.currentContributors.map((contributor, index) => (
                    <div key={contributor._id || index} className={styles.memberCard}>
                      <div className={styles.memberAvatar}>
                        {contributor.avatar ? (
                          <Image
                            src={urlFor(contributor.avatar).width(50).height(50).url()}
                            alt={contributor.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          getInitials(contributor.name)
                        )}
                      </div>
                      <div className={styles.memberInfo}>
                        <h4 className={styles.memberName}>{contributor.name}</h4>
                        <p className={styles.memberRole}>Contributor</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Application Section */}
          {canApply ? (
            <div className={styles.applySection}>
              <div className={styles.applyHeader}>
                <h2 className={styles.applyTitle}>Join This Project</h2>
                <p className={styles.applySubtitle}>
                  {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
                </p>
              </div>
              <div className={styles.applyContent}>
                <Link 
                  href={`/current-projects/${project.slug.current}/apply`}
                  className={styles.applyButton}
                >
                  Apply Now
                </Link>
                <p className={styles.applyNote}>
                  {project.applicationDeadline && (
                    <>Applications close on {formatDate(project.applicationDeadline)}. </>
                  )}
                  You'll hear back within 1-2 weeks.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.closedSection}>
              <div className={styles.closedHeader}>
                <h2 className={styles.closedTitle}>
                  {spotsLeft === 0 ? 'Team Full' : 'Applications Closed'}
                </h2>
              </div>
              <div className={styles.closedContent}>
                <p className={styles.closedMessage}>
                  {spotsLeft === 0 
                    ? 'This project has reached its maximum number of contributors.'
                    : 'This project is no longer accepting new applications.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailClient;