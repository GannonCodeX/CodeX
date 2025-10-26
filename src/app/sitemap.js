// app/sitemap.js
import { client } from '@/sanity/lib/client';

// IMPORTANT: Replace this with your actual production domain
const URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gannoncodex.com';

export default async function sitemap() {
  // Fetch all project and event slugs from Sanity
  const eventsQuery = `*[_type == "event" && defined(slug.current)][]{ "slug": slug.current, "updatedAt": _updatedAt }`;
  const projectsQuery = `*[_type == "project" && defined(slug.current)][]{ "slug": slug.current, "updatedAt": _updatedAt }`;
  const clubsQuery = `*[_type == "club" && defined(slug.current)][]{ "slug": slug.current, "updatedAt": _updatedAt }`;

  const events = await client.fetch(eventsQuery);
  const projects = await client.fetch(projectsQuery);
  const clubs = await client.fetch(clubsQuery);

  const eventUrls = events.map(event => ({
    url: `${URL}/events/${event.slug}`,
    lastModified: new Date(event.updatedAt).toISOString(),
  }));

  const projectUrls = projects.map(project => ({
    url: `${URL}/projects/${project.slug}`,
    lastModified: new Date(project.updatedAt).toISOString(),
  }));

  const clubUrls = clubs.map(club => ({
    url: `${URL}/clubs/${club.slug}`,
    lastModified: new Date(club.updatedAt).toISOString(),
  }));

  // Define static routes
  const staticRoutes = [
    '/',
    '/about', 
    '/events',
    '/projects',
    '/clubs',
    '/gallery',
    '/links',
  ];

  const staticUrls = staticRoutes.map(route => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [
    ...staticUrls,
    ...eventUrls,
    ...projectUrls,
    ...clubUrls,
  ];
}
