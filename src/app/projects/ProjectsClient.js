'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './projects.module.css';
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

export default function ProjectsClient({ projects }) {
  const [filter, setFilter] = useState('all');
  
  console.log("ProjectsClient received projects:", projects);

  const activeProjects = projects.filter(p => p.status === 'active-seeking' || p.status === 'active-progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const filteredProjects = filter === 'active' ? activeProjects : 
                          filter === 'completed' ? completedProjects : 
                          projects;

  const getStatusBadge = (project) => {
    if (project.status === 'active-seeking') {
      return <span className={styles.statusBadge + ' ' + styles.seeking}>Seeking Contributors</span>;
    }
    if (project.status === 'active-progress') {
      return <span className={styles.statusBadge + ' ' + styles.progress}>In Progress</span>;
    }
    if (project.status === 'completed') {
      return <span className={styles.statusBadge + ' ' + styles.completed}>Completed</span>;
    }
    return null;
  };

  const getProjectLink = (project) => {
    return `/projects/${project.slug}`;
  };

  return (
    <div>
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Projects ({projects.length})
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'active' ? styles.active : ''}`}
          onClick={() => setFilter('active')}
        >
          Active Projects ({activeProjects.length})
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'completed' ? styles.active : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed Projects ({completedProjects.length})
        </button>
      </div>

      <div className={styles.projectsGrid}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
            <Link href={getProjectLink(project)} key={index} className={styles.projectCard}>
              <div className={styles.cardImageWrapper}>
                {project.mainImage ? (
                  <Image
                    src={urlFor(project.mainImage).width(500).url()}
                    alt={project.title}
                    width={500}
                    height={300}
                    className={styles.cardImage}
                  />
                ) : (
                  <div className={styles.placeholderImage}>
                    <span>📋</span>
                    <p>No Image</p>
                  </div>
                )}
                {getStatusBadge(project)}
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{project.title}</h2>
                {(project.leadClub || (project.collaborators && project.collaborators.length)) && (
                  <div className={styles.clubTags}>
                    {project.leadClub && (
                      <span className={styles.clubTag}>{project.leadClub.title}</span>
                    )}
                    {project.collaborators?.map((c, i) => (
                      <span key={i} className={styles.clubTag}>{c.title}</span>
                    ))}
                  </div>
                )}
                {(project.proposerName || project.techStack || project.maxContributors) && (
                  <div className={styles.projectMeta}>
                    {project.proposerName && (
                      <span className={styles.proposer}>by {project.proposerName}</span>
                    )}
                    {project.techStack && (
                      <div className={styles.techStack}>
                        {project.techStack.split(',').slice(0, 3).map((tech, i) => (
                          <span key={i} className={styles.techTag}>{tech.trim()}</span>
                        ))}
                        {project.techStack.split(',').length > 3 && (
                          <span className={styles.techTag}>+{project.techStack.split(',').length - 3} more</span>
                        )}
                      </div>
                    )}
                    {project.skillsNeeded && project.skillsNeeded.length > 0 && (
                      <div className={styles.skillsStack}>
                        <span className={styles.skillsLabel}>Skills: </span>
                        {project.skillsNeeded.slice(0, 3).map((skill, i) => (
                          <span key={i} className={styles.skillTag}>{skill}</span>
                        ))}
                        {project.skillsNeeded.length > 3 && (
                          <span className={styles.skillTag}>+{project.skillsNeeded.length - 3} more</span>
                        )}
                      </div>
                    )}
                    {project.maxContributors && (
                      <span className={styles.contributors}>
                        {project.currentContributors?.length || 0}/{project.maxContributors} contributors
                      </span>
                    )}
                  </div>
                )}
                <p className={styles.cardExcerpt}>{project.excerpt}</p>
                <span className={styles.cardLink}>
                  {project.status === 'active-seeking' ? 'Apply to Join' : 'View Project'} &rarr;
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p>No {filter === 'all' ? '' : filter + ' '}projects to show right now. Check back soon!</p>
        )}
      </div>
    </div>
  );
}
