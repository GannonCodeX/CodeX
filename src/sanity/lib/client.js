// src/sanity/lib/client.js
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, useCdn, token } from '../env'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
  token, // Add the token here
  // These settings are recommended for Next.js >= 13.5 and Sanity client >= 3.
  perspective: 'published',
  stega: {
    enabled: false,
    studioUrl: '/admin',
  },
});
