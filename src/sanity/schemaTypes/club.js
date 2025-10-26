// src/sanity/schemaTypes/club.js

export default {
  name: 'club',
  title: 'Club',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Club Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 64,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'shortName',
      title: 'Short Name',
      type: 'string',
      description: 'Used in compact UI contexts (e.g., GUPc, ACM).',
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'website',
      title: 'Website',
      type: 'url',
    },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    },
    {
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'github', title: 'GitHub', type: 'url' },
        { name: 'discord', title: 'Discord', type: 'url' },
        { name: 'x', title: 'X/Twitter', type: 'url' },
        { name: 'instagram', title: 'Instagram', type: 'url' },
      ],
    },
    {
      name: 'theme',
      title: 'Theme',
      type: 'object',
      fields: [
        { name: 'primary', title: 'Primary Color (hex)', type: 'string' },
        { name: 'accent', title: 'Accent Color (hex)', type: 'string' },
      ],
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: { title: 'title', media: 'logo', short: 'shortName' },
    prepare({ title, media, short }) {
      return { title, subtitle: short || 'Club', media };
    },
  },
}

