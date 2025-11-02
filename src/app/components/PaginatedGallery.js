'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import styles from './PaginatedGallery.module.css';

const IMAGES_PER_PAGE = 12;

export default function PaginatedGallery({ initialImages = [] }) {
  const [images, setImages] = useState(initialImages);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialImages.length === IMAGES_PER_PAGE);
  const [selectedImage, setSelectedImage] = useState(null);

  const loadMoreImages = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const startIndex = currentPage * IMAGES_PER_PAGE;
      const endIndex = startIndex + IMAGES_PER_PAGE - 1;
      
      const query = `*[_type == "gallery"] | order(_createdAt desc) {
        "images": images[${startIndex}...${endIndex}]{
          _key,
          alt,
          caption,
          "imageUrl": image.asset->url,
          "metadata": image.asset->metadata
        }
      }.images`;
      
      const result = await client.fetch(query);
      const newImages = result ? result.flat() : [];
      
      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
        setCurrentPage(prev => prev + 1);
        setHasMore(newImages.length === IMAGES_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more images:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image, index) => {
    setSelectedImage({ ...image, index });
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateLightbox = (direction) => {
    if (!selectedImage) return;
    
    const newIndex = selectedImage.index + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      setSelectedImage({ ...images[newIndex], index: newIndex });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedImage) return;
      
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        navigateLightbox(-1);
      } else if (event.key === 'ArrowRight') {
        navigateLightbox(1);
      }
    };

    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, images]);

  if (!images || images.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>The darkroom is empty. Check back soon for new snapshots.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.galleryGrid}>
        {images.map((image, index) => (
          <div
            key={image._key || index}
            className={styles.gridItem}
            onClick={() => openLightbox(image, index)}
          >
            <Image
              src={image.imageUrl}
              alt={image.alt || image.caption || 'Gallery image'}
              width={image.metadata?.dimensions?.width || 400}
              height={image.metadata?.dimensions?.height || 300}
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
            <div className={styles.overlay}>
              {image.caption && (
                <h3 className={styles.imageTitle}>{image.caption}</h3>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button 
            onClick={loadMoreImages} 
            disabled={loading}
            className={styles.loadMoreButton}
          >
            {loading ? 'Loading...' : 'Load More Photos'}
          </button>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={closeLightbox}>
              ×
            </button>
            <button 
              className={styles.navButton + ' ' + styles.prevButton}
              onClick={() => navigateLightbox(-1)}
              disabled={selectedImage.index === 0}
            >
              ‹
            </button>
            <div className={styles.lightboxImageContainer}>
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.alt || selectedImage.caption || 'Gallery image'}
                width={selectedImage.metadata?.dimensions?.width || 1200}
                height={selectedImage.metadata?.dimensions?.height || 800}
                className={styles.lightboxImage}
              />
              {selectedImage.caption && (
                <p className={styles.lightboxCaption}>{selectedImage.caption}</p>
              )}
            </div>
            <button 
              className={styles.navButton + ' ' + styles.nextButton}
              onClick={() => navigateLightbox(1)}
              disabled={selectedImage.index === images.length - 1}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}