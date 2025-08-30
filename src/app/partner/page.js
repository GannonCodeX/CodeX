import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './partner.module.css';

export const metadata = {
  title: 'Partner with Us | Gannon CodeX',
  description: 'Explore detailed partnership opportunities with Gannon CodeX, from sponsoring projects and hosting workshops to creating a direct talent pipeline.',
};

const PartnerPage = () => {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.partnerHeader}>
          <h1 className={styles.title}>Build the Future with CodeX</h1>
          <p className={styles.subtitle}>
            A partnership with CodeX is more than just sponsorship—it's a strategic investment in the next generation of tech leaders and a direct pipeline to innovation. Let's create value, together.
          </p>
        </div>

        <section className={`${styles.section} ${styles.highlightSection}`}>
          <h2 className={styles.sectionTitle}>Why Partner with Gannon's Best?</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h3>Access Curated Talent</h3>
              <p>Stop sifting through resumes. Engage directly with our vetted members—students who build, lead, and are passionate about technology. We'll help you identify the right candidates for your team.</p>
            </div>
            <div className={styles.gridItem}>
              <h3>Drive Practical Innovation</h3>
              <p>Infuse your projects with fresh perspectives. Collaborate with our members on real-world challenges, from developing new features to exploring emerging technologies like AI and blockchain.</p>
            </div>
            <div className={styles.gridItem}>
              <h3>Amplify Your Brand</h3>
              <p>Position your company as a top destination for tech talent. Gain authentic visibility through collaborative events and projects that genuinely resonate with the student community.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Signature Partnership Programs</h2>
          <div className={styles.signatureGrid}>
            <div className={styles.programCard}>
              <h3>Project Sponsorship</h3>
              <p>Become the official sponsor of a semester-long project. Our teams will tackle a real-world problem you provide, delivering a market-ready MVP. This is your opportunity to outsource R&D and scout top talent in a practical setting.</p>
              <span className={styles.programTag}>Talent & Innovation</span>
            </div>
            <div className={styles.programCard}>
              <h3>API/SDK Challenge</h3>
              <p>Drive adoption of your developer tools. We'll host a dedicated challenge where our members build innovative applications using your technology. You get valuable feedback, user-generated projects, and brand evangelists.</p>
              <span className={styles.programTag}>Marketing & R&D</span>
            </div>
            <div className={styles.programCard}>
              <h3>Direct Recruitment Pipeline</h3>
              <p>Establish a streamlined process for hiring CodeX members. We offer exclusive info sessions, resume drops, and dedicated interview days, connecting you directly with students who fit your company culture and technical needs.</p>
              <span className={styles.programTag}>Recruitment</span>
            </div>
             <div className={styles.programCard}>
              <h3>Workshop & Tech Talk Series</h3>
              <p>Showcase your company's technical expertise. Lead a series of workshops or tech talks on topics relevant to your industry. This positions your engineers as thought leaders and attracts students interested in your domain.</p>
              <span className={styles.programTag}>Branding & Education</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Let's Get Started</h2>
          <p className={styles.getInTouchText}>
            Ready to explore a partnership that aligns with your goals? We're eager to design a custom collaboration package for you. Reach out to our partnerships team to begin the conversation.
          </p>
          <a href="mailto:gannoncodex@gmail.com" className={styles.contactButton}>
            Start the Conversation
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PartnerPage;
