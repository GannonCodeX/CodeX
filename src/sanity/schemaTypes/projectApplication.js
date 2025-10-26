// src/sanity/schemaTypes/projectApplication.js

import React from 'react'

export default {
  name: 'projectApplication',
  title: 'Project Applications',
  type: 'document',
  fields: [
    {
      name: 'project',
      title: 'Project',
      type: 'reference',
      to: [{ type: 'activeProject' }],
      description: 'The project this application is for.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'status',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending Review', value: 'pending' },
          { title: 'Under Review', value: 'reviewing' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Waitlisted', value: 'waitlisted' },
          { title: 'Withdrawn', value: 'withdrawn' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: Rule => Rule.required(),
    },
    {
      name: 'trackingId',
      title: 'Tracking ID',
      type: 'string',
      readOnly: true,
      description: 'Unique ID for the applicant to track their application status.',
    },
    {
      name: 'applicantName',
      title: 'Applicant Name',
      type: 'string',
      readOnly: true,
      validation: Rule => Rule.required(),
    },
    {
      name: 'applicantEmail',
      title: 'Applicant Email',
      type: 'string',
      readOnly: true,
      validation: Rule => Rule.required(),
    },
    {
      name: 'applicantPhone',
      title: 'Phone Number',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'gannonId',
      title: 'Gannon ID',
      type: 'string',
      readOnly: true,
      description: 'Student ID if applicable.',
    },
    {
      name: 'academicInfo',
      title: 'Academic Information',
      type: 'object',
      readOnly: true,
      fields: [
        {
          name: 'year',
          title: 'Academic Year',
          type: 'string',
        },
        {
          name: 'major',
          title: 'Major',
          type: 'string',
        },
        {
          name: 'gpa',
          title: 'GPA',
          type: 'number',
        },
      ],
    },
    {
      name: 'skillLevel',
      title: 'Overall Skill Level',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
        ],
      },
    },
    {
      name: 'relevantSkills',
      title: 'Relevant Skills',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
      description: 'Skills that match the project requirements.',
    },
    {
      name: 'experience',
      title: 'Relevant Experience',
      type: 'text',
      readOnly: true,
      description: 'Description of previous projects, internships, coursework.',
    },
    {
      name: 'motivation',
      title: 'Motivation',
      type: 'text',
      readOnly: true,
      description: 'Why the applicant wants to join this specific project.',
    },
    {
      name: 'availability',
      title: 'Availability',
      type: 'object',
      readOnly: true,
      fields: [
        {
          name: 'hoursPerWeek',
          title: 'Hours Per Week',
          type: 'string',
        },
        {
          name: 'schedule',
          title: 'Available Schedule',
          type: 'text',
        },
        {
          name: 'startDate',
          title: 'Available Start Date',
          type: 'date',
        },
      ],
    },
    {
      name: 'portfolioLinks',
      title: 'Portfolio Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Link Type',
              type: 'string',
              options: {
                list: [
                  { title: 'GitHub', value: 'github' },
                  { title: 'Portfolio Website', value: 'portfolio' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'Behance', value: 'behance' },
                  { title: 'Other', value: 'other' },
                ],
              },
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'string',
            },
          ],
          preview: {
            select: {
              type: 'type',
              url: 'url',
            },
            prepare({ type, url }) {
              return {
                title: type || 'Link',
                subtitle: url,
              };
            },
          },
        },
      ],
      readOnly: true,
    },
    {
      name: 'questionsAnswers',
      title: 'Project-Specific Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'question',
              title: 'Question',
              type: 'string',
            },
            {
              name: 'answer',
              title: 'Answer',
              type: 'text',
            },
          ],
        },
      ],
      readOnly: true,
    },
    {
      name: 'applicationDate',
      title: 'Application Date',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'reviewNotes',
      title: 'Review Notes',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Internal notes for the review process.',
    },
    {
      name: 'reviewedBy',
      title: 'Reviewed By',
      type: 'reference',
      to: [{ type: 'member' }],
      description: 'Who reviewed this application.',
    },
    {
      name: 'reviewDate',
      title: 'Review Date',
      type: 'datetime',
      description: 'When the application was reviewed.',
    },
    {
      name: 'feedbackToApplicant',
      title: 'Feedback to Applicant',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Message that will be sent to the applicant.',
    },
    {
      name: 'interviewScheduled',
      title: 'Interview Scheduled',
      type: 'object',
      fields: [
        {
          name: 'scheduled',
          title: 'Interview Scheduled',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'date',
          title: 'Interview Date',
          type: 'datetime',
        },
        {
          name: 'location',
          title: 'Location/Link',
          type: 'string',
        },
        {
          name: 'notes',
          title: 'Interview Notes',
          type: 'text',
        },
      ],
    },
  ],
  preview: {
    select: {
      applicantName: 'applicantName',
      projectTitle: 'project.title',
      status: 'status',
      applicationDate: 'applicationDate',
    },
    prepare({ applicantName, projectTitle, status, applicationDate }) {
      const statusEmoji = {
        pending: '⏳',
        reviewing: '👀',
        accepted: '✅',
        rejected: '❌',
        waitlisted: '⏰',
        withdrawn: '🚫',
      };
      
      const dateString = applicationDate 
        ? new Date(applicationDate).toLocaleDateString()
        : '';
      
      return {
        title: `${applicantName} → ${projectTitle}`,
        subtitle: `${statusEmoji[status] || '📄'} ${status} • ${dateString}`,
        media: <span style={{ fontSize: '1.5rem' }}>{statusEmoji[status] || '📄'}</span>,
      };
    },
  },
  orderings: [
    {
      title: 'Application Date, Newest First',
      name: 'applicationDateDesc',
      by: [{ field: 'applicationDate', direction: 'desc' }],
    },
    {
      title: 'Status',
      name: 'status',
      by: [{ field: 'status', direction: 'asc' }],
    },
    {
      title: 'Project',
      name: 'project',
      by: [{ field: 'project.title', direction: 'asc' }],
    },
  ],
};