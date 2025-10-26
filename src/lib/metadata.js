// src/lib/metadata.js
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = '/assets/images/2x Logo Header.png',
  url = '',
  type = 'website'
}) {
  const fullUrl = `${siteUrl}${url}`;
  const defaultKeywords = ['Gannon University', 'Gannon', 'CodeX', 'Gannon CodeX', 'Coding Club', 'Software Development', 'Erie PA', 'Programming', 'Technology'];
  const allKeywords = [...defaultKeywords, ...keywords];

  return {
    title,
    description,
    keywords: allKeywords,
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Gannon CodeX',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export const defaultMetadata = generateMetadata({
  title: 'Gannon CodeX',
  description: 'Gannon University\'s premier student-run coding organization. We build, break, and learn together through projects, workshops, and events.',
});