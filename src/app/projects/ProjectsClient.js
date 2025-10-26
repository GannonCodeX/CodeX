'use client';

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
  return (
    <div className={styles.projectsGrid}>
      {projects.length > 0 ? (
        projects.map((project, index) => (
          <Link href={`/projects/${project.slug}`} key={index} className={styles.projectCard}>
            <div className={styles.cardImageWrapper}>
              <Image
                src={urlFor(project.mainImage).width(500).url()}
                alt={project.title}
                width={500}
                height={300}
                className={styles.cardImage}
              />
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
              <p className={styles.cardExcerpt}>{project.excerpt}</p>
              <span className={styles.cardLink}>View Project &rarr;</span>
            </div>
          </Link>
        ))
      ) : (
        <p>No projects to show right now. Check back soon!</p>
      )}
    </div>
  );
}
