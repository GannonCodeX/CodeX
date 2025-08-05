// app/layout.js
import "./globals.css";

const siteUrl = 'https://your-production-domain.com'; // Replace with your actual domain later

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Gannon Codex',
    template: '%s | Gannon Codex',
  },
  description: 'Gannon University\'s student-run coding club. We build, break, and learn together.',
  openGraph: {
    title: 'Gannon Codex',
    description: 'Gannon University\'s student-run coding club.',
    url: siteUrl,
    siteName: 'Gannon Codex',
    images: [
      {
        url: '/assets/images/Neo-brutalist Poster Aug 5 2025.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}