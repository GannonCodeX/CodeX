// src/sanity/schemaTypes/gallery.js
export default {
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'A title for this gallery collection (e.g., "Workshop Photos").',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'club',
      title: 'Club',
      type: 'reference',
      to: [{ type: 'club' }],
      description: 'Optional. Leave empty for shared/cross-club galleries.',
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'galleryImage',
        },
      ],
      options: {
        layout: 'grid',
        sortable: true,
      },
    },
    {
      name: 'bulkImages',
      title: 'Bulk Upload Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
      options: {
        layout: 'grid',
      },
      description: 'Upload multiple images at once. These will be added to the main images array automatically.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      club: 'club.title',
      media: 'images.0.image.asset',
    },
    prepare({ title, club, media }) {
      return {
        title,
        subtitle: club || 'Shared Gallery',
        media,
      }
    },
  },
}
