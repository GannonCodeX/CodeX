// app/layout.js
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

// IMPORTANT: Set NEXT_PUBLIC_SITE_URL in your Vercel project settings
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
        url: '/assets/images/2x Logo Header.png', // Relative path is correct with metadataBase
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gannon CodeX',
    description: 'Gannon University\'s premier student-run coding organization.',
    images: ['/assets/images/logo.png'], // Corrected path
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
