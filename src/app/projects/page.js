// app/projects/page.js
import { client } from '@/sanity/lib/client'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import styles from './projects.module.css'
import ProjectsClient from './ProjectsClient'
export const dynamic = 'force-dynamic';
export const revalidate = 0;


import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Projects',
  description: 'Browse a collection of innovative projects built by the Gannon CodeX community. From web apps to open-source tools, see what our members are creating.',
  keywords: ['Projects', 'Portfolio', 'Web Development', 'Software Engineering', 'Open Source', 'Innovation'],
  url: '/projects'
});

async function getProjects() {
  const query = `*[_type == "project"] | order(_createdAt desc){
    title,
    "slug": slug.current,
    mainImage,
    excerpt,
    leadClub->{title, "slug": slug.current},
    collaborators[]->{title, "slug": slug.current}
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
          <h1 className={styles.title}>Student Software Development Projects - Gannon University</h1>
          <p className={styles.subtitle}>
            Explore innovative software projects, web applications, and open-source tools created by Gannon CodeX student developers. Our portfolio showcases real-world programming experience from computer science students at Gannon University in Erie, Pennsylvania.
          </p>
        </header>
        <ProjectsClient projects={projects} />
      </main>
      <Footer />
    </>
  )
}
