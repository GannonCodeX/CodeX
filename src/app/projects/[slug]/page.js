// app/projects/[slug]/page.js
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import PortableTextRenderer from '@/app/components/PortableTextRenderer'
import styles from './slug.module.css'
export const dynamic = 'force-dynamic';

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

async function getProject(slug) {
  const query = `*[_type == "project" && slug.current == $slug][0]{
    title,
    mainImage,
    excerpt,
    content[]{
      ...,
      _type == "image" => {
        "asset": asset
      }
    },
    projectLink,
    "contributors": contributors[]->{
      name,
      avatar
    }
  }`
  const project = await client.fetch(query, { slug })
  return project
}

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise; // Await the params promise
  const project = await client.fetch(`*[_type == "project" && slug.current == $slug][0]{title, excerpt, mainImage}`, { slug: params.slug });
  if (!project) {
    return { title: 'Project Not Found' }
  }

  const imageUrl = project.mainImage ? urlFor(project.mainImage).width(1200).height(630).url() : '/assets/images/logo.png';

  return {
    title: `${project.title} | Gannon CodeX`,
    description: project.excerpt,
    openGraph: {
      title: project.title,
      description: project.excerpt,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.excerpt,
      images: [imageUrl],
    },
  }
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
              {project.contributors && project.contributors.length > 0 && (
                <div className={styles.infoBox}>
                  <h2 className={styles.sidebarTitle}>// Contributors</h2>
                  <ul className={styles.contributorsList}>
                    {project.contributors.map((contributor, index) => (
                      <li key={index} className={styles.contributor}>
                        <Image
                          src={urlFor(contributor.avatar).width(50).url()}
                          alt={contributor.name}
                          width={40}
                          height={40}
                          className={styles.contributorAvatar}
                        />
                        <span>{contributor.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {project.projectLink && (
                <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className={styles.projectLinkButton}>
                  View Project
                </a>
              )}
            </aside>
            <div className={styles.mainContent}>
              <PortableTextRenderer content={project.content} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}