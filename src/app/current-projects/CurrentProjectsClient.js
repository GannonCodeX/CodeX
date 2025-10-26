'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '../../sanity/lib/image';
import styles from './current-projects.module.css';

const CurrentProjectsClient = ({ projects }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    techStack: 'all',
  });

  const uniqueTechStacks = useMemo(() => {
    const allTech = projects.flatMap(project => project.techStack || []);
    return [...new Set(allTech)].sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const statusMatch = filters.status === 'all' || project.status === filters.status;
      const difficultyMatch = filters.difficulty === 'all' || project.difficultyLevel === filters.difficulty;
      const techMatch = filters.techStack === 'all' || 
        (project.techStack && project.techStack.includes(filters.techStack));
      
      return statusMatch && difficultyMatch && techMatch;
    });
  }, [projects, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      difficulty: 'all',
      techStack: 'all',
    });
  };

  const getSpotsLeft = (project) => {
    const currentCount = project.currentContributors?.length || 0;
    return Math.max(0, project.maxContributors - currentCount);
  };

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
      'seeking-contributors': 'Open',
      'in-progress': 'In Progress',
      'full': 'Full'
    };
    return statusMap[status] || status;
  };

  return (
    <>
      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filter Projects</h3>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select 
                className={styles.filterSelect}
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="seeking-contributors">Open to Join</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Difficulty</label>
              <select 
                className={styles.filterSelect}
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner Friendly</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="mixed">Mixed Levels</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Technology</label>
              <select 
                className={styles.filterSelect}
                value={filters.techStack}
                onChange={(e) => handleFilterChange('techStack', e.target.value)}
              >
                <option value="all">All Technologies</option>
                {uniqueTechStacks.map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>

            <button 
              className={styles.clearFilters}
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className={styles.projectsSection}>
        <div className={styles.projectsContainer}>
          <div className={styles.projectsHeader}>
            <span className={styles.projectsCount}>
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {filteredProjects.length > 0 ? (
            <div className={styles.projectsGrid}>
              {filteredProjects.map(project => {
                const spotsLeft = getSpotsLeft(project);
                const isFull = spotsLeft === 0;
                const canApply = project.status === 'seeking-contributors' && !isFull;

                return (
                  <div 
                    key={project._id} 
                    className={`${styles.projectCard} ${project.featured ? styles.featured : ''}`}
                  >
                    {project.featured && (
                      <div className={styles.featuredBadge}>Featured</div>
                    )}

                    <div className={styles.projectImage}>
                      {project.projectImage ? (
                        <Image
                          src={urlFor(project.projectImage).width(400).height(200).url()}
                          alt={project.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <span>No Image Available</span>
                      )}
                    </div>

                    <div className={styles.projectContent}>
                      <div className={styles.projectHeader}>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                      </div>

                      <div className={styles.projectMeta}>
                        <span className={`${styles.metaTag} ${styles.status}`}>
                          {formatStatus(project.status)}
                        </span>
                        <span className={`${styles.metaTag} ${styles.difficulty}`}>
                          {formatDifficulty(project.difficultyLevel)}
                        </span>
                        <span className={styles.metaTag}>
                          {project.timeline}
                        </span>
                        <span className={styles.metaTag}>
                          {project.timeCommitment}
                        </span>
                      </div>

                      <p className={styles.projectDescription}>
                        {project.shortDescription}
                      </p>

                      {project.techStack && project.techStack.length > 0 && (
                        <div className={styles.projectTech}>
                          <span className={styles.techLabel}>Tech Stack</span>
                          <div className={styles.techList}>
                            {project.techStack.slice(0, 4).map((tech, index) => (
                              <span key={index} className={styles.techItem}>
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 4 && (
                              <span className={styles.techItem}>
                                +{project.techStack.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className={styles.projectFooter}>
                        <span className={`${styles.spotsLeft} ${isFull ? styles.full : ''}`}>
                          {isFull ? 'Team Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                        </span>
                        
                        {canApply ? (
                          <Link 
                            href={`/current-projects/${project.slug.current}`}
                            className={styles.applyButton}
                          >
                            View & Apply
                          </Link>
                        ) : (
                          <Link 
                            href={`/current-projects/${project.slug.current}`}
                            className={styles.applyButton}
                            style={{ 
                              backgroundColor: 'var(--subtle-gray)', 
                              color: 'var(--bg)' 
                            }}
                          >
                            View Project
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyTitle}>No Projects Found</h2>
              <p className={styles.emptyDescription}>
                No projects match your current filters. Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Link href="/propose-a-project" className={styles.emptyAction}>
                Propose a Project
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CurrentProjectsClient;