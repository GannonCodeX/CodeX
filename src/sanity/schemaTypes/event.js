// src/sanity/schemaTypes/event.js

export default {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'leadClub',
      title: 'Lead Club',
      type: 'reference',
      to: [{ type: 'club' }],
      description: 'Primary host of this event.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'coHosts',
      title: 'Co-hosting Clubs',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'club' } }],
      description: 'Other clubs co-hosting this event.',
    },
    {
      name: 'title',
      title: 'Event Title',
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
      description: 'A unique URL part for the event. Click "Generate" to create one from the title.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'UPCOMING' },
          { title: 'Past', value: 'PAST' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date & Time',
      type: 'datetime',
      validation: Rule => Rule.required(),
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g., "Zurn Science Center, Room 101" or "Online via Discord"',
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      description: 'A brief summary shown on the main events page.',
    },
    {
      name: 'content',
      title: 'Full Event Details',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
        { type: 'code' }
      ],
      description: 'The main content for the event page. Use this for detailed descriptions, schedules, speaker bios, etc.',
    },
    {
      name: 'rsvpLink',
      title: 'RSVP Link',
      type: 'url',
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      status: 'status',
      leadClub: 'leadClub.title',
      media: 'mainImage',
    },
    prepare({ title, date, status, leadClub, media }) {
      const dateString = new Date(date).toLocaleDateString();
      return {
        title: title,
        subtitle: `${dateString} - ${status}${leadClub ? ' — ' + leadClub : ''}`,
        media,
      };
    },
  },
};
