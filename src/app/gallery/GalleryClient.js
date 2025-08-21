// src/app/gallery/GalleryClient.js
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './gallery.module.css';

const builder = imageUrlBuilder(client);
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';

function urlFor(source) {
  return builder.image(source);
}

const GalleryClient = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className={styles.galleryGrid}>
        {images.map((image) => (
          <div key={image._id} className={styles.gridItem} onClick={() => openLightbox(image)}>
            <Image
              src={urlFor(image.imageUrl).url()}
              alt={image.alt}
              width={image.metadata.dimensions.width}
              height={image.metadata.dimensions.height}
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className={styles.overlay}>
              <h3 className={styles.imageTitle}>{image.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={styles.closeButton}>&times;</button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <Image
              src={urlFor(selectedImage.imageUrl).url()}
              alt={selectedImage.alt}
              width={selectedImage.metadata.dimensions.width}
              height={selectedImage.metadata.dimensions.height}
              className={styles.lightboxImage}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryClient;
