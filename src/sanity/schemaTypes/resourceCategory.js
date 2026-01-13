// src/sanity/schemaTypes/resourceCategory.js

export default {
  name: 'resourceCategory',
  title: 'Resource Category',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji or icon name',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    },
  ],
  preview: {
    select: {
      title: 'name',
      icon: 'icon',
      order: 'order',
    },
    prepare({ title, icon, order }) {
      return {
        title: icon ? `${icon} ${title}` : title,
        subtitle: `Order: ${order || 0}`,
      }
    },
  },
}
