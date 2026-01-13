// src/sanity/schemaTypes/clubResource.js

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
        list: [
          { title: 'Link', value: 'link' },
          { title: 'Document', value: 'document' },
          { title: 'Template', value: 'template' },
          { title: 'Guide', value: 'guide' },
        ],
      },
    },
    {
      name: 'url',
      title: 'External URL',
      type: 'url',
      hidden: ({ document }) => document?.resourceType !== 'link',
    },
    {
      name: 'file',
      title: 'File',
      type: 'file',
      hidden: ({ document }) => document?.resourceType === 'link',
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
