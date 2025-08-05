import React from 'react';
import Link from 'next/link';
import styles from './links.module.css';
import LinksVectors from '../components/LinksVectors';

export const metadata = {
  title: 'Links | Gannon CodeX',
  description: 'Your one-stop hub for all official Gannon CodeX links. Find our Discord, GitHub, social media, and more.',
};

const links = [
  { title: 'Official Website', url: '/' },
  { title: 'Join Our Discord', url: '#' },
  { title: 'Follow on Instagram', url: '#' },
  { title: 'Check our GitHub', url: '#' },
  { title: 'Latest Project: Campus Navigator', url: '#' },
  { title: 'Upcoming Event: Git Workshop', url: '#' },
];

const LinksPage = () => {
  return (
    <div className={styles.wrapper}>
      <LinksVectors />
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          GCX
        </Link>
        <h1 className={styles.title}>Gannon Codex</h1>
        <p className={styles.subtitle}>Your one-stop hub for all our links.</p>
      </header>
      <main className={styles.linksContainer}>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkCard}
          >
            {link.title}
          </a>
        ))}
      </main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Gannon Codex
      </footer>
    </div>
  );
};

export default LinksPage;
