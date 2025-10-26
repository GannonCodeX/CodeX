// src/sanity/schemaTypes/member.js

export default {
  name: 'member',
  title: 'Member',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role / Position',
      type: 'string',
      description: 'e.g., "President & Lead Dev"',
      validation: Rule => Rule.required(),
    },
    {
      name: 'affiliations',
      title: 'Club Affiliations',
      type: 'array',
      description: 'Assign this member to one or more clubs and optionally mark e-board roles.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'club', title: 'Club', type: 'reference', to: [{ type: 'club' }], validation: Rule => Rule.required() },
            { name: 'clubRole', title: 'Role in Club', type: 'string', description: 'e.g., President, Treasurer' },
            { name: 'isEboard', title: 'E-Board Member', type: 'boolean', initialValue: false },
          ],
        },
      ],
    },
    {
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true, // Enables smart cropping
      },
      validation: Rule => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'avatar',
    },
  },
};
