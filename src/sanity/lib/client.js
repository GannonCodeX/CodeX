// src/sanity/lib/client.js
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn: process.env.NODE_ENV === 'production',
})
