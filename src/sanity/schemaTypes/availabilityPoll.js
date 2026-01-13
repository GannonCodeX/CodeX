// src/sanity/schemaTypes/availabilityPoll.js

export default {
  name: 'availabilityPoll',
  title: 'Availability Poll',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Poll Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "Weekly Meeting Time" or "Hackathon Planning"',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional details about this poll',
    },
    {
      name: 'club',
      title: 'Club',
      type: 'reference',
      to: [{ type: 'club' }],
      description: 'Optionally associate this poll with a club',
    },
    {
      name: 'createdBy',
      title: 'Created By',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Name of the person who created this poll',
    },
    {
      name: 'createdByEmail',
      title: 'Creator Email',
      type: 'string',
      description: 'Email for notifications (optional)',
    },
    {
      name: 'dates',
      title: 'Dates',
      type: 'array',
      of: [{ type: 'date' }],
      validation: (Rule) => Rule.required().min(1),
      description: 'Select the dates to include in this poll',
    },
    {
      name: 'startTime',
      title: 'Start Time',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Earliest time slot (e.g., "09:00")',
      initialValue: '09:00',
    },
    {
      name: 'endTime',
      title: 'End Time',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Latest time slot (e.g., "21:00")',
      initialValue: '21:00',
    },
    {
      name: 'timeSlotMinutes',
      title: 'Time Slot Duration',
      type: 'number',
      options: {
        list: [
          { title: '15 minutes', value: 15 },
          { title: '30 minutes', value: 30 },
          { title: '60 minutes', value: 60 },
        ],
      },
      initialValue: 30,
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'timezone',
      title: 'Timezone',
      type: 'string',
      initialValue: 'America/New_York',
      description: 'Timezone for the poll times',
    },
    {
      name: 'responses',
      title: 'Responses',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'response',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'email',
              title: 'Email',
              type: 'string',
            },
            {
              name: 'availability',
              title: 'Availability',
              type: 'array',
              of: [{ type: 'string' }],
              description: 'Array of available slot IDs (date_time format)',
            },
            {
              name: 'submittedAt',
              title: 'Submitted At',
              type: 'datetime',
            },
          ],
          preview: {
            select: {
              name: 'name',
              slots: 'availability',
            },
            prepare({ name, slots }) {
              return {
                title: name,
                subtitle: `${slots?.length || 0} slots selected`,
              };
            },
          },
        },
      ],
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'Optional expiration date for this poll',
    },
  ],
  preview: {
    select: {
      title: 'title',
      createdBy: 'createdBy',
      club: 'club.shortName',
      responses: 'responses',
    },
    prepare({ title, createdBy, club, responses }) {
      const responseCount = responses?.length || 0;
      return {
        title,
        subtitle: `${club ? club + ' • ' : ''}by ${createdBy} • ${responseCount} response${responseCount !== 1 ? 's' : ''}`,
      };
    },
  },
};
