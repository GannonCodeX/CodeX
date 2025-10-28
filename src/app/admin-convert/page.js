import React from 'react';
import AdminConvertClient from './AdminConvertClient';
import { client } from '../../sanity/lib/client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Convert Proposals | Admin',
  description: 'Convert approved project proposals to active projects',
};

async function getApprovedProposals() {
  const query = `*[_type == "projectProposal" && status == "approved" && !defined(convertedToActiveProject)] | order(presentationTime desc) {
    _id,
    trackingId,
    projectName,
    proposerName,
    proposerEmail,
    description,
    techStack,
    timeline,
    goals,
    teamMembers[]->{
      name,
      _id
    },
    presentationTime
  }`;
  
  try {
    const proposals = await client.fetch(query);
    return proposals;
  } catch (error) {
    console.error("Failed to fetch approved proposals:", error);
    return [];
  }
}

const AdminConvertPage = async () => {
  const proposals = await getApprovedProposals();

  return (
    <div style={{ padding: '2rem', fontFamily: 'var(--sans)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: '2rem', marginBottom: '2rem' }}>
          Convert Proposals to Active Projects
        </h1>
        
        <p style={{ marginBottom: '2rem', color: 'var(--subtle-gray)' }}>
          Convert approved project proposals into active projects that can recruit team members.
        </p>

        <AdminConvertClient proposals={proposals} />
      </div>
    </div>
  );
};

export default AdminConvertPage;