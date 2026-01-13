export default {
  name: 'clubOfficer',
  title: 'Club Officer',
  type: 'document',
  fields: [
    { name: 'email', title: 'Email', type: 'string', validation: Rule => Rule.required().email() },
    { name: 'club', title: 'Club', type: 'reference', to: [{ type: 'club' }], validation: Rule => Rule.required() },
    { name: 'role', title: 'Role', type: 'string', options: { list: ['president', 'vice_president', 'treasurer', 'secretary', 'officer'] } },
    { name: 'member', title: 'Member Profile', type: 'reference', to: [{ type: 'member' }] },
    { name: 'accessToken', title: 'Access Token', type: 'string', readOnly: true },
    { name: 'tokenExpiry', title: 'Token Expiry', type: 'datetime', readOnly: true },
    { name: 'isActive', title: 'Is Active', type: 'boolean', initialValue: true }
  ],
  preview: {
    select: { email: 'email', club: 'club.title', role: 'role' },
    prepare({ email, club, role }) {
      return { title: email, subtitle: `${role || 'Officer'} at ${club || 'Unknown Club'}` }
    }
  }
}
