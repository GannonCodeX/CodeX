'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './gallery.module.css';

const GalleryClient = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openLightbox = (image) => setSelectedImage(image);
  const closeLightbox = () => setSelectedImage(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };

    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <>
      <div className={styles.galleryGrid}>
        {images.map((image) => (
          <div
            key={image._key}
            className={styles.gridItem}
            onClick={() => openLightbox(image)}
          >
            <Image
              src={image.imageUrl}
              alt={image.alt}
              width={image.metadata.dimensions.width}
              height={image.metadata.dimensions.height}
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className={styles.overlay}>
              <h3 className={styles.imageTitle}>{image.caption}</h3>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={closeLightbox}>
              &times;
            </button>
            <Image
              src={selectedImage.imageUrl}
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
