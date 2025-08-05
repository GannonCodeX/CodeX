// app/layout.js
import "./globals.css";

// IMPORTANT: Replace this with your actual production domain
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gannoncodex.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Gannon CodeX',
    template: '%s | Gannon CodeX',
  },
  description: 'Gannon University\'s premier student-run coding organization. We build, break, and learn together through projects, workshops, and events.',
  keywords: ['Gannon University', 'Gannon', 'CodeX', 'Gannon CodeX', 'Coding Club', 'Software Development', 'Erie PA'],
  openGraph: {
    title: 'Gannon CodeX',
    description: 'Gannon University\'s premier student-run coding organization.',
    url: siteUrl,
    siteName: 'Gannon CodeX',
    images: [
      {
        url: '/assets/images/2x Logo Header.png', // Assuming this is the correct path in /public
        width: 1200, // Replace with actual width
        height: 630, // Replace with actual height
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gannon CodeX',
    description: 'Gannon University\'s premier student-run coding organization.',
    images: [siteUrl + '/assets/images/2x Logo Header.png'], // Must be an absolute URL
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}