'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';
import styles from './EventGallery.module.css';

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

const IMAGES_PER_PAGE = 12;

export default function EventGallery({ galleryId, initialImages = [] }) {
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
      
      const query = `*[_type == "gallery" && _id == $galleryId][0]{
        images[${startIndex}...${endIndex}]{
          image,
          caption,
          alt
        }
      }`;
      
      const result = await client.fetch(query, { galleryId });
      const newImages = result?.images || [];
      
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

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section className={styles.gallerySection}>
      <h2>Event Gallery</h2>
      <div className={styles.galleryGrid}>
        {images.map((item, index) => (
          <div 
            key={index} 
            className={styles.galleryItem}
            onClick={() => openLightbox(item, index)}
          >
            <Image
              src={urlFor(item.image).width(400).height(300).url()}
              alt={item.alt || item.caption || `Gallery image ${index + 1}`}
              width={400}
              height={300}
              className={styles.galleryImage}
              loading="lazy"
            />
            {item.caption && (
              <p className={styles.galleryCaption}>{item.caption}</p>
            )}
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
        <div className={styles.lightbox} onClick={closeLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeLightbox}>×</button>
            <button 
              className={styles.navButton + ' ' + styles.prevButton}
              onClick={() => navigateLightbox(-1)}
              disabled={selectedImage.index === 0}
            >
              ‹
            </button>
            <div className={styles.lightboxImageContainer}>
              <Image
                src={urlFor(selectedImage.image).width(1200).height(800).url()}
                alt={selectedImage.alt || selectedImage.caption || 'Gallery image'}
                width={1200}
                height={800}
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
    </section>
  );
}