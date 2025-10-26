// src/components/StructuredData.js
export default function StructuredData({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gannon CodeX",
    "description": "Gannon University's premier student-run coding organization",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/assets/images/2x Logo Header.png`,
    "foundingDate": "2020",
    "location": {
      "@type": "Place",
      "name": "Gannon University",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "109 University Square",
        "addressLocality": "Erie",
        "addressRegion": "PA",
        "postalCode": "16541",
        "addressCountry": "US"
      }
    },
    "parentOrganization": {
      "@type": "Organization",
      "name": "Gannon University"
    },
    "sameAs": [
      "https://engageu.gannon.edu/organization/guprogramming"
    ]
  };
}

export function generateEventSchema(event) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.date,
    "location": {
      "@type": "Place",
      "name": event.location || "Gannon University"
    },
    "organizer": {
      "@type": "Organization",
      "name": event.leadClub?.title || "Gannon CodeX",
      "url": siteUrl
    },
    "url": `${siteUrl}/events/${event.slug}`
  };
}

export function generateProjectSchema(project) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.excerpt,
    "creator": {
      "@type": "Organization",
      "name": project.leadClub?.title || "Gannon CodeX"
    },
    "url": `${siteUrl}/projects/${project.slug}`,
    "image": project.mainImage ? project.mainImage : `${siteUrl}/assets/images/2x Logo Header.png`
  };
}