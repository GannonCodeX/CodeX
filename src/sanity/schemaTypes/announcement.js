// src/sanity/schemaTypes/announcement.js

export default {
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
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
      description: 'A unique URL part for the announcement. Click "Generate" to create one from the title.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'club',
      title: 'Club',
      type: 'reference',
      to: [{ type: 'club' }],
      description: 'The club this announcement belongs to.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
      description: 'The main content of the announcement.',
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When this announcement was published.',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'pinned',
      title: 'Pinned',
      type: 'boolean',
      description: 'Pin this announcement to the top of the list.',
      initialValue: false,
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'News', value: 'news' },
          { title: 'Update', value: 'update' },
          { title: 'Alert', value: 'alert' },
        ],
        layout: 'radio',
      },
      initialValue: 'news',
    },
  ],
  preview: {
    select: {
      title: 'title',
      publishedAt: 'publishedAt',
      type: 'type',
      pinned: 'pinned',
      club: 'club.title',
    },
    prepare({ title, publishedAt, type, pinned, club }) {
      const typeEmoji = {
        news: '📰',
        update: '🔄',
        alert: '🚨',
      };
      const dateString = publishedAt
        ? new Date(publishedAt).toLocaleDateString()
        : 'No date';
      const pinnedLabel = pinned ? '📌 ' : '';
      return {
        title: `${pinnedLabel}${title}`,
        subtitle: `${typeEmoji[type] || '📄'} ${type || 'news'} • ${dateString}${club ? ' • ' + club : ''}`,
      };
    },
  },
  orderings: [
    {
      title: 'Pinned & Recent',
      name: 'pinnedAndRecent',
      by: [
        { field: 'pinned', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
    {
      title: 'Most Recent',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
};
