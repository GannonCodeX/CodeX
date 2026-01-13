// src/sanity/schemaTypes/clubOfficer.js
// Authentication-only schema. Role/position comes from member.affiliations[]

export default {
  name: 'clubOfficer',
  title: 'Club Officer',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
      description: 'Email used for magic link authentication',
    },
    {
      name: 'club',
      title: 'Club',
      type: 'reference',
      to: [{ type: 'club' }],
      validation: Rule => Rule.required(),
    },
    {
      name: 'member',
      title: 'Member Profile',
      type: 'reference',
      to: [{ type: 'member' }],
      validation: Rule => Rule.required(),
      description: 'Link to member profile. Role is determined by member.affiliations[].clubRole',
    },
    {
      name: 'accessToken',
      title: 'Access Token',
      type: 'string',
      readOnly: true,
      hidden: true,
    },
    {
      name: 'tokenExpiry',
      title: 'Token Expiry',
      type: 'datetime',
      readOnly: true,
      hidden: true,
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to enable/disable dashboard access',
    },
  ],
  preview: {
    select: {
      email: 'email',
      club: 'club.title',
      memberName: 'member.name',
      isActive: 'isActive',
    },
    prepare({ email, club, memberName, isActive }) {
      const status = isActive ? 'Active' : 'Inactive'
      return {
        title: memberName || email,
        subtitle: `${club || 'Unknown Club'} - ${status}`,
      }
    },
  },
}
