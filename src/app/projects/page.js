// app/projects/page.js
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import styles from './projects.module.css'

export const metadata = {
  title: 'Projects | Gannon CodeX',
  description: 'Browse a collection of innovative projects built by the Gannon CodeX community. From web apps to open-source tools, see what our members are creating.',
};

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

async function getProjects() {
  const query = `*[_type == "project"] | order(_createdAt desc){
    title,
    "slug": slug.current,
    mainImage,
    excerpt
  }`
  const projects = await client.fetch(query)
  return projects
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <>
      <Header />
      <main className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title}>Our Work</h1>
          <p className={styles.subtitle}>
            A collection of projects built by the Gannon Codex community.
          </p>
        </header>

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
                  <p className={styles.cardExcerpt}>{project.excerpt}</p>
                  <span className={styles.cardLink}>View Project &rarr;</span>
                </div>
              </Link>
            ))
          ) : (
            <p>No projects to show right now. Check back soon!</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
