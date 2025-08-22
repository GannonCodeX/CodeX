// app/components/Gallery.js
import { client } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import Image from 'next/image'
import Link from 'next/link'
import styles from './Gallery.module.css'

export const revalidate = 0;

const builder = imageUrlBuilder(client)

function urlFor(source) {
  return builder.image(source)
}

async function getLatestHappenings() {
  const projectQuery = `*[_type == "project"] | order(_createdAt desc)[0...2]{
    _type,
    title,
    "slug": slug.current,
    mainImage,
    excerpt
  }`

  const eventQuery = `*[_type == "event" && status == "UPCOMING"] | order(date asc)[0...2]{
    _type,
    title,
    "slug": slug.current,
    mainImage,
    date
  }`

  const projects = await client.fetch(projectQuery, { next: { revalidate: 0 } })
  const events = await client.fetch(eventQuery, { next: { revalidate: 0 } })

  // Format and combine the data
  const formattedProjects = projects.map(p => ({ ...p, type: 'Project', subtitle: p.excerpt, href: `/projects/${p.slug}` }))
  const formattedEvents = events.map(e => ({ ...e, type: 'Event', subtitle: new Date(e.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }), href: `/events/${e.slug}` }))

  // Distribute items into two columns
  const allItems = [...formattedProjects, ...formattedEvents].slice(0, 4)
  const column1 = allItems.filter((_, i) => i % 2 === 0)
  const column2 = allItems.filter((_, i) => i % 2 !== 0)

  return { column1, column2 }
}

const GalleryCard = ({ item }) => (
  <Link href={item.href} className={styles.card}>
    <div className={styles.imageWrapper}>
      {item.mainImage && (
        <Image
          src={urlFor(item.mainImage).width(600).url()}
          alt={item.title}
          width={600}
          height={400}
          className={styles.image}
        />
      )}
    </div>
    <div className={styles.info}>
      <span className={styles.tag}>{item.type}</span>
      <h3 className={styles.title}>{item.title}</h3>
      <p className={styles.subtitle}>{item.subtitle}</p>
    </div>
  </Link>
);

const Gallery = async () => {
  const { column1, column2 } = await getLatestHappenings()

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.heading}>// LATEST HAPPENINGS</h2>
      <div className={styles.gallery}>
        <div className={styles.column}>
          {column1.map((item, index) => (
            <GalleryCard key={index} item={item} />
          ))}
        </div>
        <div className={styles.column}>
          {column2.map((item, index) => (
            <GalleryCard key={index} item={item} />
          ))}
        </div>
      </div>
      <div className={styles.ctaContainer}>
        <Link href="/projects" className="button">
          Explore All Projects & Events
        </Link>
      </div>
    </section>
  );
};

export default Gallery;
