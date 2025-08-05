import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} Gannon Codex
      </div>
      <div className={styles.links}>
        <a href="https://github.com/gannon-codex" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://discord.gg/your-invite" target="_blank" rel="noopener noreferrer">Discord</a>
        <a href="mailto:contact@gannoncodex.com">Contact</a>
      </div>
    </footer>
  );
};

export default Footer;
