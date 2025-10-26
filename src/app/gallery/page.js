// src/app/gallery/page.js
import React from 'react';
import styles from './gallery.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { client } from '@/sanity/lib/client';
import GalleryClient from './GalleryClient';
import { unstable_noStore as noStore } from 'next/cache';
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = createMetadata({
  title: 'Gallery',
  description: 'Explore photos from Gannon CodeX events, workshops, hackathons, and team moments. See our community in action and the memories we\'ve made together.',
  keywords: ['Gallery', 'Photos', 'Events', 'Community', 'Memories', 'Team Photos'],
  url: '/gallery'
});

async function getGalleryImages() {
  noStore(); // 🔒 disable caching for this fetch path

  const query = `*[_type == "gallery"] | order(_createdAt desc) {
    "images": images[]{
      _key,
      alt,
      caption,
      "imageUrl": image.asset->url,
      "metadata": image.asset->metadata
    }
  }.images`;

  const result = await client.fetch(query);
  return result ? result.flat().slice(0, 9) : [];
}

export default async function GalleryPage() {
  noStore();

  const images = await getGalleryImages();

  return (
    <>
      <Header />
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.subtitle}>
            Raw moments from the workshops, competitions, and late-night coding
            sessions that define the CodeX experience.
          </p>
        </header>

        {images?.length > 0 ? (
          <GalleryClient images={images} />
        ) : (
          <div className={styles.emptyState}>
            <p>The darkroom is empty. Check back soon for new snapshots.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
