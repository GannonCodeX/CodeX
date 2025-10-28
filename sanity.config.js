'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/admin/[[...tool]]/page.jsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { codeInput } from '@sanity/code-input'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'
import { 
  ConvertToActiveProjectAction, 
  AcceptApplicationAction, 
  RejectApplicationAction 
} from './src/sanity/lib/documentActions'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    codeInput(),
  ],
  // Add custom document actions
  document: {
    actions: (prev, context) => {
      const customActions = []
      
      // Add convert action for project proposals
      if (context.schemaType === 'projectProposal') {
        customActions.push(ConvertToActiveProjectAction)
      }
      
      // Add accept/reject actions for project applications
      if (context.schemaType === 'projectApplication') {
        customActions.push(AcceptApplicationAction)
        customActions.push(RejectApplicationAction)
      }
      
      return [...prev, ...customActions]
    }
  }
})