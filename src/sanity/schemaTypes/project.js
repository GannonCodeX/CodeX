// src/sanity/schemaTypes/project.js

export default {
  name: 'project',
  title: 'Project',
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
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'A short summary of the project for the main projects page.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'content',
      title: 'Full Project Details',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }, { type: 'code' }],
      description: 'The main content for the project page.',
    },
    {
      name: 'contributors',
      title: 'Contributors',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'member' } }],
      description: 'Select the members who worked on this project.',
    },
    {
      name: 'projectLink',
      title: 'Live Project/GitHub Link',
      type: 'url',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
};
