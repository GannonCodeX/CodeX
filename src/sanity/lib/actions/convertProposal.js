// src/sanity/lib/actions/convertProposal.js
import { defineAction } from '@sanity/client'

export const convertProposalAction = {
  name: 'convertToActiveProject',
  title: 'Convert to Active Project',
  icon: () => '🚀',
  condition: (props) => {
    // Only show for approved proposals that haven't been converted
    return props.draft?.status === 'approved' && !props.draft?.convertedToActiveProject
  },
  execute: async (props, context) => {
    const { getClient, schema } = context
    const client = getClient({ apiVersion: '2023-01-01' })
    
    try {
      // Call our conversion API
      const response = await fetch('/api/convert-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: props.id,
          maxContributors: 5,
          skillsNeeded: ['Programming', 'Problem Solving'],
          difficultyLevel: 'intermediate'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message)
      }

      // Show success message
      context.toast.push({
        status: 'success',
        title: 'Proposal Converted!',
        description: `Successfully created active project: ${result.projectUrl}`
      })

      // Refresh the document
      return {
        type: 'success',
        message: 'Proposal converted to active project successfully!'
      }

    } catch (error) {
      context.toast.push({
        status: 'error',
        title: 'Conversion Failed',
        description: error.message
      })
      
      return {
        type: 'error',
        message: error.message
      }
    }
  }
}