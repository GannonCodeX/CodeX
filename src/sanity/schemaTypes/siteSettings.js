// src/sanity/schemaTypes/siteSettings.js

export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton - only one document of this type should exist
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'CodeX',
      validation: Rule => Rule.required(),
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short description shown in various places',
      initialValue: 'Gannon University CS Clubs Hub',
    },
    {
      name: 'logo',
      title: 'Site Logo',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'featuredClubs',
      title: 'Featured Clubs',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'club' }] }],
      description: 'Clubs to highlight on the homepage',
    },
    {
      name: 'hero',
      title: 'Homepage Hero',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
          initialValue: 'Build. Learn. Connect.',
        },
        {
          name: 'subtitle',
          title: 'Subtitle',
          type: 'text',
          rows: 2,
        },
        {
          name: 'ctaText',
          title: 'Button Text',
          type: 'string',
          initialValue: 'Explore Clubs',
        },
        {
          name: 'ctaLink',
          title: 'Button Link',
          type: 'string',
          initialValue: '/clubs',
        },
      ],
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'discord', title: 'Discord', type: 'url' },
        { name: 'github', title: 'GitHub', type: 'url' },
        { name: 'instagram', title: 'Instagram', type: 'url' },
        { name: 'linkedin', title: 'LinkedIn', type: 'url' },
        { name: 'x', title: 'X/Twitter', type: 'url' },
      ],
    },
    {
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      description: 'Primary contact email for the site',
    },
    {
      name: 'maintenanceMode',
      title: 'Maintenance Mode',
      type: 'boolean',
      initialValue: false,
      description: 'Enable to show maintenance message to visitors',
    },
    {
      name: 'maintenanceMessage',
      title: 'Maintenance Message',
      type: 'text',
      hidden: ({ document }) => !document?.maintenanceMode,
    },
  ],
  preview: {
    select: {
      title: 'siteName',
      subtitle: 'tagline',
      media: 'logo',
    },
  },
}
