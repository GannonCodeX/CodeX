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
      description: 'Club logo/avatar image',
    },
    {
      name: 'bannerImage',
      title: 'Banner Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Large banner image for club page header',
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
      name: 'engage',
      title: 'Engage Link',
      type: 'url',
      description: 'Link to the club\'s Gannon Engage page',
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
        { name: 'linkedin', title: 'LinkedIn', type: 'url' },
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
    {
      name: 'acceptingMembers',
      title: 'Accepting New Members',
      type: 'boolean',
      initialValue: true,
      description: 'Is the club currently accepting new members?',
    },
    {
      name: 'joinInstructions',
      title: 'Join Instructions',
      type: 'text',
      description: 'How can someone join this club? Describe the process.',
    },
    {
      name: 'joinLink',
      title: 'Join Link',
      type: 'url',
      description: 'External link to join form (e.g., Google Forms, Engage page)',
    },
    {
      name: 'membershipRequirements',
      title: 'Membership Requirements',
      type: 'text',
      description: 'Any requirements for membership (e.g., "Must be CS major", "Open to all students")',
    },
    {
      name: 'meetingSchedule',
      title: 'Meeting Schedule',
      type: 'object',
      fields: [
        {
          name: 'dayOfWeek',
          title: 'Day of Week',
          type: 'string',
          options: {
            list: [
              { title: 'Monday', value: 'Monday' },
              { title: 'Tuesday', value: 'Tuesday' },
              { title: 'Wednesday', value: 'Wednesday' },
              { title: 'Thursday', value: 'Thursday' },
              { title: 'Friday', value: 'Friday' },
              { title: 'Saturday', value: 'Saturday' },
              { title: 'Sunday', value: 'Sunday' },
            ],
          },
        },
        {
          name: 'time',
          title: 'Time',
          type: 'string',
          description: 'e.g., "6:00 PM" or "3:30 PM"',
        },
        {
          name: 'frequency',
          title: 'Frequency',
          type: 'string',
          options: {
            list: [
              { title: 'Weekly', value: 'weekly' },
              { title: 'Biweekly', value: 'biweekly' },
              { title: 'Monthly', value: 'monthly' },
            ],
          },
          initialValue: 'weekly',
        },
      ],
    },
    {
      name: 'meetingLocation',
      title: 'Meeting Location',
      type: 'string',
      description: 'e.g., "Zurn 262" or "Science Building Room 101"',
    },
    {
      name: 'meetingNotes',
      title: 'Meeting Notes',
      type: 'text',
      description: 'Additional info like "No meetings during finals week"',
    },
    {
      name: 'gallery',
      title: 'Photo Gallery',
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
      description: 'Club photo gallery images with captions',
    },
  ],
  preview: {
    select: { title: 'title', media: 'logo', short: 'shortName' },
    prepare({ title, media, short }) {
      return { title, subtitle: short || 'Club', media };
    },
  },
}

