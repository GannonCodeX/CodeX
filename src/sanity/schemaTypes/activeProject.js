// src/sanity/schemaTypes/activeProject.js

export default {
  name: 'activeProject',
  title: 'Active Projects',
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
          { title: 'Seeking Contributors', value: 'seeking-contributors' },
          { title: 'Team Full', value: 'full' },
          { title: 'In Progress', value: 'in-progress' },
          { title: 'On Hold', value: 'on-hold' },
          { title: 'Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
      initialValue: 'seeking-contributors',
      validation: Rule => Rule.required(),
    },
    {
      name: 'leadClub',
      title: 'Lead Club',
      type: 'reference',
      to: [{ type: 'club' }],
      description: 'Primary club managing this project.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'projectManager',
      title: 'Project Manager',
      type: 'reference',
      to: [{ type: 'member' }],
      description: 'The main point of contact for this project.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'description',
      title: 'Project Description',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'code' }
      ],
      description: 'Detailed description of the project goals, features, and scope.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      description: 'Brief summary for project listings (max 200 characters).',
      validation: Rule => Rule.required().max(200),
    },
    {
      name: 'techStack',
      title: 'Technology Stack',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Technologies, frameworks, and tools used in this project.',
      validation: Rule => Rule.required().min(1),
    },
    {
      name: 'skillsNeeded',
      title: 'Skills Needed',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What skills are we looking for in contributors?',
      validation: Rule => Rule.required().min(1),
    },
    {
      name: 'difficultyLevel',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner Friendly', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
          { title: 'Mixed Levels', value: 'mixed' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'timeline',
      title: 'Project Timeline',
      type: 'string',
      description: 'Expected duration (e.g., "2-3 months", "Semester-long")',
      validation: Rule => Rule.required(),
    },
    {
      name: 'timeCommitment',
      title: 'Time Commitment',
      type: 'string',
      description: 'Expected hours per week (e.g., "3-5 hours/week")',
      validation: Rule => Rule.required(),
    },
    {
      name: 'maxContributors',
      title: 'Maximum Contributors',
      type: 'number',
      description: 'Maximum number of people who can join this project.',
      validation: Rule => Rule.required().min(1).max(20),
    },
    {
      name: 'currentContributors',
      title: 'Current Contributors',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'member' } }],
      description: 'People currently working on this project.',
    },
    {
      name: 'requirements',
      title: 'Requirements & Prerequisites',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'What should applicants know or have before joining?',
    },
    {
      name: 'learningOpportunities',
      title: 'Learning Opportunities',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'What will contributors learn from this project?',
    },
    {
      name: 'meetingSchedule',
      title: 'Meeting Schedule',
      type: 'string',
      description: 'When does the team meet? (e.g., "Weekly Fridays 6PM")',
    },
    {
      name: 'communicationChannel',
      title: 'Communication Channel',
      type: 'string',
      description: 'Where does the team communicate? (e.g., "Discord #project-name")',
    },
    {
      name: 'repositoryUrl',
      title: 'Repository URL',
      type: 'url',
      description: 'GitHub or GitLab repository link (if public)',
    },
    {
      name: 'projectImage',
      title: 'Project Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Main image for the project (mockups, diagrams, etc.)',
    },
    {
      name: 'applicationDeadline',
      title: 'Application Deadline',
      type: 'datetime',
      description: 'When do applications close? (optional)',
    },
    {
      name: 'startDate',
      title: 'Project Start Date',
      type: 'date',
      description: 'When will the project officially begin?',
    },
    {
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Show this project prominently on the current projects page.',
      initialValue: false,
    },
    {
      name: 'originalProposal',
      title: 'Original Proposal',
      type: 'reference',
      to: [{ type: 'projectProposal' }],
      description: 'The proposal that this project was created from (if applicable).',
    },
  ],
  preview: {
    select: {
      title: 'title',
      status: 'status',
      leadClub: 'leadClub.title',
      maxContributors: 'maxContributors',
      currentContributors: 'currentContributors',
      media: 'projectImage',
    },
    prepare({ title, status, leadClub, maxContributors, currentContributors, media }) {
      const spotsLeft = maxContributors - (currentContributors?.length || 0);
      const statusEmoji = {
        'seeking-contributors': '🔍',
        'full': '✅',
        'in-progress': '🚀',
        'on-hold': '⏸️',
        'completed': '🏁',
      };
      
      return {
        title,
        subtitle: `${leadClub} • ${spotsLeft} spots left • ${statusEmoji[status] || '📄'} ${status}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'title', direction: 'asc' }
      ],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
};