// sanity/schemas/event.js

export default {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Event Title',
      type: 'string',
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
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g., "Zurn Science Center, Room 101" or "Online via Discord"',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
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
    },
    prepare({ title, date, status }) {
      const dateString = new Date(date).toLocaleDateString();
      return {
        title: title,
        subtitle: `${dateString} - ${status}`,
      };
    },
  },
};
