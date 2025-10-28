'use client';

import React, { useState } from 'react';

const AdminConvertClient = ({ proposals }) => {
  const [converting, setConverting] = useState(null);
  const [converted, setConverted] = useState(new Set());

  const handleConvert = async (proposal) => {
    if (!confirm(`Convert "${proposal.projectName}" to an active project?`)) {
      return;
    }

    setConverting(proposal._id);

    try {
      const response = await fetch('/api/convert-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: proposal._id,
          maxContributors: 5,
          skillsNeeded: ['Programming', 'Problem Solving'],
          difficultyLevel: 'intermediate'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      alert(`✅ Success! Created active project at: ${result.projectUrl}`);
      setConverted(prev => new Set(prev).add(proposal._id));

    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setConverting(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  if (proposals.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem', 
        border: '2px solid var(--border-color)',
        borderRadius: '8px'
      }}>
        <h2 style={{ fontFamily: 'var(--mono)', color: 'var(--fg)' }}>
          No Approved Proposals
        </h2>
        <p style={{ color: 'var(--subtle-gray)' }}>
          There are no approved project proposals ready for conversion.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {proposals.map((proposal) => (
        <div 
          key={proposal._id}
          style={{
            border: converted.has(proposal._id) 
              ? '3px solid var(--code-green)' 
              : '2px solid var(--border-color)',
            padding: '1.5rem',
            backgroundColor: 'var(--bg)',
            opacity: converted.has(proposal._id) ? 0.6 : 1
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '1.3rem', 
                color: 'var(--fg)',
                margin: '0 0 0.5rem 0'
              }}>
                {proposal.projectName}
              </h3>
              
              <p style={{ 
                color: 'var(--subtle-gray)', 
                margin: '0 0 1rem 0',
                fontSize: '0.9rem'
              }}>
                Proposed by: {proposal.proposerName} ({proposal.proposerEmail})
              </p>

              <p style={{ 
                color: 'var(--subtle-gray)', 
                margin: '0 0 1rem 0',
                lineHeight: 1.5
              }}>
                {proposal.description?.substring(0, 200)}
                {proposal.description?.length > 200 && '...'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Tech Stack:
                  </strong>
                  <div style={{ color: 'var(--subtle-gray)', fontSize: '0.9rem' }}>
                    {proposal.techStack || 'Not specified'}
                  </div>
                </div>
                
                <div>
                  <strong style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Timeline:
                  </strong>
                  <div style={{ color: 'var(--subtle-gray)', fontSize: '0.9rem' }}>
                    {proposal.timeline || 'Not specified'}
                  </div>
                </div>

                <div>
                  <strong style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Team Members:
                  </strong>
                  <div style={{ color: 'var(--subtle-gray)', fontSize: '0.9rem' }}>
                    {proposal.teamMembers?.length || 0} proposed
                  </div>
                </div>

                <div>
                  <strong style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    Presentation:
                  </strong>
                  <div style={{ color: 'var(--subtle-gray)', fontSize: '0.9rem' }}>
                    {formatDate(proposal.presentationTime)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginLeft: '2rem' }}>
              {converted.has(proposal._id) ? (
                <div style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: 'var(--code-green)',
                  color: 'var(--fg)',
                  fontFamily: 'var(--mono)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem'
                }}>
                  ✅ Converted
                </div>
              ) : (
                <button
                  onClick={() => handleConvert(proposal)}
                  disabled={converting === proposal._id}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: converting === proposal._id ? 'var(--subtle-gray)' : 'var(--accent)',
                    color: 'var(--fg)',
                    border: 'none',
                    fontFamily: 'var(--mono)',
                    fontWeight: 'bold',
                    cursor: converting === proposal._id ? 'not-allowed' : 'pointer',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem'
                  }}
                >
                  {converting === proposal._id ? 'Converting...' : '🚀 Convert to Active Project'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminConvertClient;