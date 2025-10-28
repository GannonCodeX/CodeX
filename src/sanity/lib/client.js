// src/sanity/lib/client.js
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, useCdn, token } from '../env'

// Fallback configuration for build time
const config = {
  apiVersion: apiVersion || '2025-08-05',
  dataset: dataset || 'production',
  projectId: projectId || 'placeholder',
  useCdn: useCdn ?? false,
  token: token || undefined,
  // These settings are recommended for Next.js >= 13.5 and Sanity client >= 3.
  perspective: 'published',
  stega: {
    enabled: false,
    studioUrl: '/admin',
  },
};

export const client = createClient(config);

// Validate required configuration at runtime, not build time
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  if (!projectId || projectId === 'placeholder') {
    console.error(
      'Missing Sanity Project ID. Please set NEXT_PUBLIC_SANITY_PROJECT_ID environment variable.'
    );
  }

  if (!dataset) {
    console.error(
      'Missing Sanity Dataset. Please set NEXT_PUBLIC_SANITY_DATASET environment variable.'
    );
  }
}
