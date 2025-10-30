'use client';

import { useState } from 'react';
import styles from './applications.module.css';

const ApplicationsManager = ({ applications, project, projectSlug }) => {
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const statusCounts = {
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [applicationId]: true }));
    
    try {
      const response = await fetch('/api/accept-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Reload the page to show updated data
        window.location.reload();
      } else {
        alert('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating application status');
    } finally {
      setActionLoading(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending Review', class: styles.statusPending },
      reviewing: { text: 'Under Review', class: styles.statusReviewing },
      accepted: { text: 'Accepted', class: styles.statusAccepted },
      rejected: { text: 'Rejected', class: styles.statusRejected },
      waitlisted: { text: 'Waitlisted', class: styles.statusWaitlisted },
    };
    
    const badge = badges[status] || { text: status, class: styles.statusDefault };
    return (
      <span className={`${styles.statusBadge} ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.applicationsContainer}>
      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({applications.length})
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({statusCounts.pending})
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'reviewing' ? styles.active : ''}`}
          onClick={() => setFilter('reviewing')}
        >
          Reviewing ({statusCounts.reviewing})
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'accepted' ? styles.active : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({statusCounts.accepted})
        </button>
        <button 
          className={`${styles.filterTab} ${filter === 'rejected' ? styles.active : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({statusCounts.rejected})
        </button>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No {filter === 'all' ? '' : filter + ' '}applications</h3>
          <p>
            {filter === 'all' 
              ? 'No one has applied to this project yet.' 
              : `No ${filter} applications found.`
            }
          </p>
        </div>
      ) : (
        <div className={styles.applicationsList}>
          {filteredApplications.map((application) => (
            <div key={application._id} className={styles.applicationCard}>
              <div className={styles.cardHeader}>
                <div className={styles.applicantInfo}>
                  <h3 className={styles.applicantName}>{application.applicantName}</h3>
                  <p className={styles.applicantEmail}>{application.applicantEmail}</p>
                  <p className={styles.applicationDate}>
                    Applied {formatDate(application.applicationDate)}
                  </p>
                </div>
                <div className={styles.statusSection}>
                  {getStatusBadge(application.status)}
                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.applicationDetails}>
                  <div className={styles.detailRow}>
                    <strong>Skill Level:</strong> {application.skillLevel}
                  </div>
                  
                  {application.relevantSkills && application.relevantSkills.length > 0 && (
                    <div className={styles.detailRow}>
                      <strong>Skills:</strong> {application.relevantSkills.join(', ')}
                    </div>
                  )}
                  
                  <div className={styles.detailRow}>
                    <strong>Availability:</strong> {application.availability?.hoursPerWeek}
                    {application.availability?.startDate && 
                      ` (Starting ${new Date(application.availability.startDate).toLocaleDateString()})`
                    }
                  </div>

                  {application.experience && (
                    <div className={styles.experienceSection}>
                      <strong>Experience:</strong>
                      <p className={styles.experienceText}>{application.experience}</p>
                    </div>
                  )}

                  {application.motivation && (
                    <div className={styles.motivationSection}>
                      <strong>Why they want to join:</strong>
                      <p className={styles.motivationText}>{application.motivation}</p>
                    </div>
                  )}

                  {application.portfolioLinks && application.portfolioLinks.length > 0 && (
                    <div className={styles.portfolioSection}>
                      <strong>Portfolio Links:</strong>
                      <div className={styles.portfolioLinks}>
                        {application.portfolioLinks.map((link, index) => (
                          <a 
                            key={index} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.portfolioLink}
                          >
                            {link.type === 'github' && '🔗 GitHub'}
                            {link.type === 'portfolio' && '🌐 Portfolio'}
                            {link.type === 'linkedin' && '💼 LinkedIn'}
                            {link.type === 'other' && '🔗 Link'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {application.status === 'pending' && (
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleStatusChange(application._id, 'accepted')}
                      disabled={actionLoading[application._id]}
                    >
                      {actionLoading[application._id] ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      className={styles.reviewButton}
                      onClick={() => handleStatusChange(application._id, 'reviewing')}
                      disabled={actionLoading[application._id]}
                    >
                      Mark as Reviewing
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleStatusChange(application._id, 'rejected')}
                      disabled={actionLoading[application._id]}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {application.status === 'reviewing' && (
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleStatusChange(application._id, 'accepted')}
                      disabled={actionLoading[application._id]}
                    >
                      {actionLoading[application._id] ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleStatusChange(application._id, 'rejected')}
                      disabled={actionLoading[application._id]}
                    >
                      Reject
                    </button>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <span className={styles.trackingId}>
                    ID: {application.trackingId}
                  </span>
                  <a 
                    href={`mailto:${application.applicantEmail}?subject=Re: Your application to ${project.title}`}
                    className={styles.emailButton}
                  >
                    📧 Email Applicant
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsManager;