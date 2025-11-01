// src/sanity/schemaTypes/project.js

export default {
  name: 'project',
  title: 'Projects',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'status',
      title: 'Project Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Proposed - Pending Review', value: 'proposed' },
          { title: 'Active - Seeking Contributors', value: 'active-seeking' },
          { title: 'Active - In Progress', value: 'active-progress' },
          { title: 'Completed', value: 'completed' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: Rule => Rule.required(),
    },
    {
      name: 'description',
      title: 'Project Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Full description of the project goals, requirements, and scope.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Short Description',
      type: 'text',
      description: 'Brief summary for project cards and previews.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'mainImage',
      title: 'Project Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Optional project image. If not provided, a placeholder will be shown.',
    },
    {
      name: 'leadClub',
      title: 'Lead Club',
      type: 'reference',
      to: [{ type: 'club' }],
      description: 'Primary owner/sponsor of this project.',
    },
    {
      name: 'collaborators',
      title: 'Collaborating Clubs',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'club' } }],
      description: 'Other clubs collaborating on this project.',
    },
    {
      name: 'projectLink',
      title: 'Project Link',
      type: 'url',
      description: 'Live demo, GitHub repository, or main project URL.',
    },
    
    // Proposal-specific fields (shown when status is 'proposed')
    {
      name: 'proposerName',
      title: 'Proposer Name',
      type: 'string',
      hidden: ({ document }) => !['proposed'].includes(document?.status),
      description: 'Name of the person proposing this project.',
    },
    {
      name: 'proposerEmail',
      title: 'Proposer Email',
      type: 'string',
      hidden: ({ document }) => !['proposed'].includes(document?.status),
      description: 'Contact email for the proposer.',
    },
    {
      name: 'proposerPhone',
      title: 'Proposer Phone',
      type: 'string',
      hidden: ({ document }) => !['proposed'].includes(document?.status),
    },
    {
      name: 'gannonId',
      title: 'Gannon ID',
      type: 'string',
      hidden: ({ document }) => !['proposed'].includes(document?.status),
      description: 'Student/Staff ID of proposer.',
    },
    {
      name: 'academicInfo',
      title: 'Academic Information',
      type: 'object',
      hidden: ({ document }) => !['proposed'].includes(document?.status),
      fields: [
        {
          name: 'year',
          title: 'Academic Year',
          type: 'string',
          options: {
            list: [
              { title: 'Freshman', value: 'freshman' },
              { title: 'Sophomore', value: 'sophomore' },
              { title: 'Junior', value: 'junior' },
              { title: 'Senior', value: 'senior' },
              { title: 'Graduate Student', value: 'graduate' },
              { title: 'Faculty', value: 'faculty' },
              { title: 'Staff', value: 'staff' },
            ],
          },
        },
        {
          name: 'major',
          title: 'Major/Department',
          type: 'string',
        },
      ],
    },
    {
      name: 'presentationTime',
      title: 'Proposed Presentation Time',
      type: 'datetime',
      hidden: ({ document }) => !['proposed'].includes(document?.status),
      readOnly: true,
    },
    
    // Active project fields (shown when status starts with 'active')
    {
      name: 'difficultyLevel',
      title: 'Difficulty Level',
      type: 'string',
      hidden: ({ document }) => !document?.status?.startsWith('active'),
      options: {
        list: [
          { title: 'Beginner Friendly', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
          { title: 'Expert', value: 'expert' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'skillsNeeded',
      title: 'Skills Needed',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }) => !document?.status?.startsWith('active'),
      description: 'What skills are contributors expected to have or learn?',
    },
    {
      name: 'techStack',
      title: 'Technology Stack',
      type: 'string',
      hidden: ({ document }) => !document?.status?.startsWith('active'),
      description: 'Technologies, frameworks, languages used (comma-separated).',
    },
    {
      name: 'timeline',
      title: 'Expected Timeline',
      type: 'string',
      hidden: ({ document }) => !document?.status?.startsWith('active'),
      description: 'How long is this project expected to take?',
    },
    {
      name: 'timeCommitment',
      title: 'Time Commitment',
      type: 'string',
      hidden: ({ document }) => !document?.status?.startsWith('active'),
      options: {
        list: [
          { title: '1-3 hours/week', value: '1-3' },
          { title: '4-6 hours/week', value: '4-6' },
          { title: '7-10 hours/week', value: '7-10' },
          { title: '10+ hours/week', value: '10+' },
          { title: 'Flexible', value: 'flexible' },
        ],
      },
    },
    {
      name: 'maxContributors',
      title: 'Maximum Contributors',
      type: 'number',
      hidden: ({ document }) => !document?.status?.startsWith('active'),
      description: 'Maximum number of people who can work on this project.',
      validation: Rule => Rule.min(1).max(20),
    },
    {
      name: 'currentContributors',
      title: 'Current Contributors',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'member' } }],
      description: 'Members currently working on this project.',
    },
    {
      name: 'applicationDeadline',
      title: 'Application Deadline',
      type: 'datetime',
      hidden: ({ document }) => document?.status !== 'active-seeking',
      description: 'When applications close for this project.',
    },
    {
      name: 'customQuestions',
      title: 'Application Questions',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }) => document?.status !== 'active-seeking',
      description: 'Custom questions for applicants to answer.',
    },
    
    // Legacy proposal fields for backward compatibility
    {
      name: 'goals',
      title: 'Project Goals',
      type: 'text',
      rows: 10,
      description: 'Project goals in markdown format. Use **bold**, *italic*, ### headers, - lists, etc.',
      options: {
        language: 'markdown'
      },
    },
    {
      name: 'estimatedBudget',
      title: 'Estimated Budget',
      type: 'number',
      description: 'Estimated project budget in USD.',
    },
    {
      name: 'fundingSource',
      title: 'Funding Source',
      type: 'string',
      description: 'Source of project funding (e.g., Club Budget, Sponsorship, etc.).',
    },
    {
      name: 'budgetBreakdown',
      title: 'Budget Breakdown',
      type: 'text',
      rows: 15,
      description: 'Detailed budget breakdown in markdown format. Use **bold**, ### headers, - lists, etc.',
      options: {
        language: 'markdown'
      },
    },
    {
      name: 'specialRequests',
      title: 'Special Requests',
      type: 'text',
      rows: 10,
      description: 'Special requests and requirements in markdown format. Use **bold**, *italic*, ### headers, - lists, etc.',
      options: {
        language: 'markdown'
      },
    },
    {
      name: 'presentation',
      title: 'Presentation File',
      type: 'file',
      hidden: ({ document }) => !['proposed'].includes(document?.status),
      description: 'Legacy field from proposal system.',
    },
    {
      name: 'teamMembers',
      title: 'Proposed Team Members',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'member' } }],
      hidden: ({ document }) => !['proposed'].includes(document?.status),
      description: 'Legacy field from proposal system.',
    },
    
    // All project lifecycle fields
    {
      name: 'trackingId',
      title: 'Tracking ID',
      type: 'string',
      readOnly: true,
      description: 'Unique identifier for tracking.',
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      status: 'status',
      leadClub: 'leadClub.title',
      proposerName: 'proposerName',
      excerpt: 'excerpt',
    },
    prepare({ title, media, status, leadClub, proposerName, excerpt }) {
      const statusEmoji = {
        draft: '📝',
        proposed: '📋',
        'active-seeking': '🔍',
        'active-progress': '⚡',
        completed: '✅',
        archived: '📦',
      };
      
      const statusLabel = status ? `${statusEmoji[status] || '📄'} ${status}` : '';
      const owner = leadClub || proposerName || '';
      
      return {
        title,
        subtitle: [statusLabel, owner, excerpt].filter(Boolean).join(' • '),
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Status (Active first)',
      name: 'statusPriority',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'title', direction: 'asc' }
      ],
    },
    {
      title: 'Recently Created',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
};