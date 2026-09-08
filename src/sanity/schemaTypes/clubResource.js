// src/sanity/schemaTypes/clubResource.js
import { RESOURCE_TYPES, RESOURCE_LEVELS, RESOURCE_SECTIONS } from '../../lib/resources.mjs'

export default {
  name: 'clubResource',
  title: 'Club Resource',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'club',
      title: 'Club',
      type: 'reference',
      to: [{ type: 'club' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'resourceCategory' }],
    },
    {
      name: 'resourceType',
      title: 'Resource Type',
      type: 'string',
      options: {
        list: RESOURCE_TYPES.map(({ value, label }) => ({ title: label, value })),
      },
    },
    {
      name: 'librarySection',
      title: 'Resource Library Collection',
      type: 'string',
      description: 'Include this public resource in /resources. Leave blank to show it only on its club page.',
      options: { list: RESOURCE_SECTIONS.map(({ value, label }) => ({ title: label, value })) },
    },
    {
      name: 'difficulty',
      title: 'Experience Level',
      type: 'string',
      initialValue: 'all',
      options: { list: RESOURCE_LEVELS.map(({ value, label }) => ({ title: label, value })) },
    },
    {
      name: 'url',
      title: 'External URL',
      type: 'url',
      description: 'Link to a video, website, course, or shared file. Used before the uploaded file if both are set.',
      validation: Rule => Rule.uri({ scheme: ['http', 'https'] }),
    },
    {
      name: 'file',
      title: 'File',
      type: 'file',
      hidden: ({ document }) => ['link', 'video', 'course', 'tool', 'other'].includes(document?.resourceType),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'accessLevel',
      title: 'Access Level',
      type: 'string',
      options: {
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Members Only', value: 'members' },
        ],
      },
      initialValue: 'public',
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],
  preview: {
    select: {
      title: 'title',
      club: 'club.name',
      clubTitle: 'club.title',
      category: 'category.name',
    },
    prepare({ title, club, clubTitle, category }) {
      const clubName = club || clubTitle || 'No club'
      return {
        title,
        subtitle: `${clubName} • ${category || 'Uncategorized'}`,
      }
    },
  },
}
