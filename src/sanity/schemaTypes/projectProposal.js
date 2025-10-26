// sanity/schemas/projectProposal.js
import React from 'react'

export default {
  name: 'projectProposal',
  title: 'Project Proposals',
  type: 'document',
  fields: [
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'In Review', value: 'in-review' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'boardComments',
      title: 'Board Comments & Feedback',
      description: 'Comments for the proposer. They will be notified of any updates.',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'trackingId',
      title: 'Tracking ID',
      type: 'string',
      readOnly: true,
      description: 'The unique ID for the proposal status page.',
    },
    {
      name: 'proposerName',
      title: 'Proposer Name',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'proposerEmail',
      title: 'Proposer Email',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'projectName',
      title: 'Project Name',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'techStack',
      title: 'Proposed Tech Stack',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'timeline',
      title: 'Estimated Timeline',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'goals',
      title: 'Goals & Success Metrics',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'estimatedBudget',
      title: 'Estimated Budget ($)',
      type: 'number',
      readOnly: true,
    },
    {
      name: 'fundingSource',
      title: 'Funding Source',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'budgetBreakdown',
      title: 'Budget Breakdown',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'specialRequests',
      title: 'Special Requests',
      type: 'text',
      readOnly: true,
    },
    {
      name: 'teamMembers',
      title: 'Proposed Team Members',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'member' } }],
      readOnly: true,
    },
    {
      name: 'presentation',
      title: 'Presentation File',
      type: 'file',
      readOnly: true,
    },
    {
      name: 'presentationTime',
      title: 'Proposed Presentation Time',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'convertedToActiveProject',
      title: 'Converted to Active Project',
      type: 'reference',
      to: [{ type: 'activeProject' }],
      description: 'Reference to the active project created from this proposal.',
    },
    {
      name: 'conversionDate',
      title: 'Conversion Date',
      type: 'datetime',
      description: 'When this proposal was converted to an active project.',
    },
  ],
  preview: {
    select: {
      title: 'projectName',
      subtitle: 'proposerName',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      const statusEmoji = {
        pending: '⏳',
        'in-review': '👀',
        approved: '✅',
        rejected: '❌',
      };
      return {
        title,
        subtitle: `by ${subtitle}`,
        media: <span style={{ fontSize: '1.5rem' }}>{statusEmoji[status] || '📄'}</span>,
      };
    },
  },
  orderings: [
    {
      title: 'Presentation Time, Newest First',
      name: 'presentationTimeDesc',
      by: [{ field: 'presentationTime', direction: 'desc' }],
    },
  ],
};