// src/app/gallery/page.js
import React from 'react';
import styles from './gallery.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { client } from '@/sanity/lib/client';
import GalleryClient from './GalleryClient'; // Import the new client component

async function getGalleryImages() {
  // Fetch the first 9 images for the curated grid
  const query = `*[_type == "galleryImage"] | order(_createdAt desc)[0...9]{
    _id,
    title,
    alt,
    "imageUrl": image.asset->url,
    "metadata": image.asset->metadata
  }`;
  const images = await client.fetch(query);
  return images;
}

const GalleryPage = async () => {
  const images = await getGalleryImages();

  return (
    <>
      <Header />
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.subtitle}>
            Raw moments from the workshops, competitions, and late-night coding sessions that define the CodeX experience.
          </p>
        </header>

        {images && images.length > 0 ? (
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
};

export default GalleryPage;