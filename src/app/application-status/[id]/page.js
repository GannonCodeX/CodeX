import React from 'react';
import { notFound } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PortableTextRenderer from '../../components/PortableTextRenderer';
import styles from './status.module.css';
import { client } from '../../../sanity/lib/client';
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const application = await getApplication(params.id);
  
  if (!application) {
    return createMetadata({
      title: 'Application Not Found',
      description: 'The requested application could not be found.',
    });
  }

  return createMetadata({
    title: `Application Status - ${application.project?.title}`,
    description: `Track your application status for ${application.project?.title} at Gannon CodeX`,
    url: `/application-status/${params.id}`
  });
}

async function getApplication(trackingId) {
  const query = `*[_type == "projectApplication" && trackingId == $trackingId][0] {
    _id,
    trackingId,
    status,
    applicantName,
    applicantEmail,
    applicationDate,
    reviewDate,
    feedbackToApplicant,
    project->{
      title,
      slug,
      leadClub->{
        title
      },
      projectManager->{
        name,
        email
      }
    },
    interviewScheduled,
    reviewNotes
  }`;
  
  try {
    const application = await client.fetch(query, { trackingId });
    return application;
  } catch (error) {
    console.error("Failed to fetch application from Sanity:", error);
    return null;
  }
}

const ApplicationStatusPage = async ({ params }) => {
  const application = await getApplication(params.id);

  if (!application) {
    notFound();
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        title: 'Pending Review',
        description: 'Your application has been received and is waiting to be reviewed by the project team.',
        color: 'var(--accent)',
        emoji: '⏳'
      },
      reviewing: {
        title: 'Under Review',
        description: 'The project team is currently reviewing your application.',
        color: 'var(--blush-purple)',
        emoji: '👀'
      },
      accepted: {
        title: 'Accepted',
        description: 'Congratulations! Your application has been accepted. The project manager will contact you soon.',
        color: 'var(--code-green)',
        emoji: '✅'
      },
      rejected: {
        title: 'Not Selected',
        description: 'Thank you for your interest. Unfortunately, we cannot offer you a position on this project at this time.',
        color: 'var(--subtle-gray)',
        emoji: '❌'
      },
      waitlisted: {
        title: 'Waitlisted',
        description: 'You\'ve been placed on the waitlist. We\'ll contact you if a position becomes available.',
        color: 'var(--accent)',
        emoji: '⏰'
      },
      withdrawn: {
        title: 'Withdrawn',
        description: 'This application has been withdrawn.',
        color: 'var(--subtle-gray)',
        emoji: '🚫'
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusInfo = getStatusInfo(application.status);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Application Status</h1>
            <p className={styles.subtitle}>
              Tracking application for <strong>{application.project?.title}</strong>
            </p>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusHeader} style={{ borderColor: statusInfo.color }}>
              <div className={styles.statusEmoji}>{statusInfo.emoji}</div>
              <div className={styles.statusContent}>
                <h2 className={styles.statusTitle} style={{ color: statusInfo.color }}>
                  {statusInfo.title}
                </h2>
                <p className={styles.statusDescription}>
                  {statusInfo.description}
                </p>
              </div>
            </div>

            <div className={styles.statusDetails}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Applicant</span>
                  <span className={styles.detailValue}>{application.applicantName}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Project</span>
                  <span className={styles.detailValue}>{application.project?.title}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Lead Club</span>
                  <span className={styles.detailValue}>{application.project?.leadClub?.title}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Application Date</span>
                  <span className={styles.detailValue}>{formatDate(application.applicationDate)}</span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Tracking ID</span>
                  <span className={styles.detailValue} style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>
                    {application.trackingId}
                  </span>
                </div>

                {application.reviewDate && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Last Updated</span>
                    <span className={styles.detailValue}>{formatDate(application.reviewDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interview Information */}
          {application.interviewScheduled?.scheduled && (
            <div className={styles.interviewCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Interview Scheduled</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.interviewDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date & Time</span>
                    <span className={styles.detailValue}>
                      {formatDate(application.interviewScheduled.date)}
                    </span>
                  </div>
                  
                  {application.interviewScheduled.location && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Location</span>
                      <span className={styles.detailValue}>
                        {application.interviewScheduled.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {application.feedbackToApplicant && application.feedbackToApplicant.length > 0 && (
            <div className={styles.feedbackCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Feedback from Project Team</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.feedback}>
                  <PortableTextRenderer content={application.feedbackToApplicant} />
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className={styles.nextStepsCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>What's Next?</h3>
            </div>
            <div className={styles.cardContent}>
              {application.status === 'pending' && (
                <div className={styles.nextSteps}>
                  <p>Your application is in the queue for review. The project team typically responds within 1-2 weeks.</p>
                  <p>In the meantime, feel free to browse other <a href="/current-projects" className={styles.link}>current projects</a>.</p>
                </div>
              )}
              
              {application.status === 'reviewing' && (
                <div className={styles.nextSteps}>
                  <p>The project team is actively reviewing your application. You should hear back soon!</p>
                </div>
              )}

              {application.status === 'accepted' && (
                <div className={styles.nextSteps}>
                  <p>🎉 Welcome to the team! The project manager ({application.project?.projectManager?.name}) will contact you at {application.applicantEmail} with onboarding information.</p>
                  <p>If you don't hear from them within 2-3 days, feel free to reach out directly.</p>
                </div>
              )}

              {application.status === 'waitlisted' && (
                <div className={styles.nextSteps}>
                  <p>You're on the waitlist for this project. If a spot opens up, we'll contact you immediately.</p>
                  <p>Consider applying to other <a href="/current-projects" className={styles.link}>current projects</a> in the meantime.</p>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className={styles.nextSteps}>
                  <p>While this particular project wasn't a match, there are many other opportunities available.</p>
                  <p>Check out our <a href="/current-projects" className={styles.link}>current projects</a> or <a href="/propose-a-project" className={styles.link}>propose your own project</a>.</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <a href="/current-projects" className={styles.actionButton}>
              Browse More Projects
            </a>
            <a href={`/current-projects/${application.project?.slug?.current}`} className={`${styles.actionButton} ${styles.secondary}`}>
              View Project Details
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ApplicationStatusPage;