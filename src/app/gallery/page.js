// src/app/gallery/page.js
import React from 'react';
import styles from './gallery.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { client } from '@/sanity/lib/client';
import PaginatedGallery from '../components/PaginatedGallery';
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
  noStore(); // disable caching for this fetch path

  const query = `*[_type == "gallery"] | order(_createdAt desc) {
    _id,
    title,
    "clubName": club->title,
    "clubSlug": club->slug.current,
    "images": images[0...12]{
      _key,
      alt,
      caption,
      "imageUrl": image.asset->url,
      "metadata": image.asset->metadata
    }
  }`;

  const galleries = await client.fetch(query);
  if (!galleries) return [];

  // Flatten images but preserve club info
  const images = [];
  for (const gallery of galleries) {
    for (const image of gallery.images || []) {
      images.push({
        ...image,
        galleryTitle: gallery.title,
        clubName: gallery.clubName,
        clubSlug: gallery.clubSlug
      });
    }
  }
  return images;
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

        <PaginatedGallery initialImages={images} />
      </main>
      <Footer />
    </>
  );
}
