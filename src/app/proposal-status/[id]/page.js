// app/proposal-status/[id]/page.js
import { client } from '../../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import styles from './status.module.css';

async function getProposal(id) {
  const query = `*[_type == "projectProposal" && trackingId == $id][0]`;
  const proposal = await client.fetch(query, { id });
  return proposal;
}

export default async function ProposalStatusPage({ params }) {
  const { id } = params;
  const proposal = await getProposal(id);

  if (!proposal) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <h1 className={styles.title}>Proposal Not Found</h1>
          <p>We couldn't find a proposal with that tracking ID. Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  const statusInfo = {
    pending: { text: 'Pending Review', color: '#ffa500' },
    'in-review': { text: 'In Review', color: '#0070f3' },
    approved: { text: 'Approved', color: '#008000' },
    rejected: { text: 'Rejected', color: '#ff0000' },
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p>Status for proposal:</p>
          <h1 className={styles.title}>{proposal.projectName}</h1>
          <div className={styles.statusBadge} style={{ backgroundColor: statusInfo[proposal.status]?.color || '#888' }}>
            {statusInfo[proposal.status]?.text || 'Unknown'}
          </div>
        </header>

        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Board Comments & Feedback</h2>
          {proposal.boardComments ? (
            <div className={styles.comments}>
              <PortableText value={proposal.boardComments} />
            </div>
          ) : (
            <p>No comments from the board yet. You'll be notified of any updates.</p>
          )}
        </div>
      </div>
       <footer className={styles.footer}>
        This is a private link for tracking your proposal. Do not share it publicly.
      </footer>
    </div>
  );
}
