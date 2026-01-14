import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';
import MembersMarquee from './MembersMarquee'; // Import the client component

const builder = imageUrlBuilder(client);

function urlFor(source) {
  return builder.image(source);
}

async function getMembers() {
  // Only fetch members who are on the executive board of at least one club
  const query = `*[_type == "member" && count(affiliations[isEboard == true]) > 0]{
    name,
    role,
    avatar,
    affiliations[isEboard == true]{
      "clubTitle": club->title,
      "clubShort": club->shortName,
      clubRole,
      isEboard
    }
  }`;
  const sanityMembers = await client.fetch(query, { next: { revalidate: 0 } });
  if (sanityMembers && sanityMembers.length > 0) {
    return sanityMembers
      .filter(member => member.name) // Only include members with names
      .map(member => ({
        ...member,
        avatar: member.avatar ? urlFor(member.avatar).width(300).height(300).url() : null,
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
