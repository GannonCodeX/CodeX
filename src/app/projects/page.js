// app/projects/page.js
import { client } from '@/sanity/lib/client'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import styles from './projects.module.css'
import ProjectsClient from './ProjectsClient'

export const metadata = {
  title: 'Projects | Gannon CodeX',
  description: 'Browse a collection of innovative projects built by the Gannon CodeX community. From web apps to open-source tools, see what our members are creating.',
};

async function getProjects() {
  const query = `*[_type == "project"] | order(_createdAt desc){
    title,
    "slug": slug.current,
    mainImage,
    excerpt
  }`
  const projects = await client.fetch(query, { next: { revalidate: 0 } })
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
        <ProjectsClient projects={projects} />
      </main>
      <Footer />
    </>
  )
}