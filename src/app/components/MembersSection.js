import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';
import MembersMarquee from './MembersMarquee'; // Import the client component

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

async function getMembers() {
  const query = `*[_type == "member"]{ name, role, avatar }`;
  const sanityMembers = await client.fetch(query, { next: { revalidate: 0 } });
  if (sanityMembers && sanityMembers.length > 0) {
    return sanityMembers.map(member => ({
      ...member,
      avatar: urlFor(member.avatar).width(300).height(300).url(),
    }));
  }
  return [];
}

export default async function MembersSection() {
  const members = await getMembers();

  if (members.length === 0) {
    return null;
  }

  return <MembersMarquee initialMembers={members} />;
}