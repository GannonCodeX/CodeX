import { NextResponse } from 'next/server';
import { client } from '../../../sanity/lib/client';

export async function POST(request) {
  try {
    const { proposalId, projectManagerId, maxContributors = 5, skillsNeeded = [], difficultyLevel = 'intermediate' } = await request.json();

    if (!proposalId) {
      return NextResponse.json({ 
        message: 'Proposal ID is required' 
      }, { status: 400 });
    }

    // Fetch the approved proposal
    const proposal = await client.fetch(
      `*[_type == "projectProposal" && _id == $proposalId && status == "approved"][0] {
        _id,
        trackingId,
        proposerName,
        proposerEmail,
        projectName,
        description,
        techStack,
        timeline,
        goals,
        teamMembers[]->{
          _id,
          name
        },
        estimatedBudget,
        fundingSource,
        budgetBreakdown,
        specialRequests
      }`,
      { proposalId }
    );

    if (!proposal) {
      return NextResponse.json({ 
        message: 'Approved proposal not found' 
      }, { status: 404 });
    }

    // Check if this proposal has already been converted
    const existingProject = await client.fetch(
      `*[_type == "activeProject" && originalProposal._ref == $proposalId][0]`,
      { proposalId }
    );

    if (existingProject) {
      return NextResponse.json({ 
        message: 'This proposal has already been converted to an active project',
        existingProjectId: existingProject._id
      }, { status: 400 });
    }

    // Generate slug from project name
    const slug = proposal.projectName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create the active project document
    const activeProjectDoc = {
      _type: 'activeProject',
      title: proposal.projectName,
      slug: {
        _type: 'slug',
        current: slug
      },
      status: 'seeking-contributors',
      leadClub: {
        _type: 'reference',
        _ref: 'codex-club-id' // You may need to create a default club or make this configurable
      },
      ...(projectManagerId && {
        projectManager: {
          _type: 'reference',
          _ref: projectManagerId
        }
      }),
      shortDescription: proposal.description?.substring(0, 200) + (proposal.description?.length > 200 ? '...' : ''),
      description: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: proposal.description || ''
            }
          ]
        },
        ...(proposal.goals ? [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: '\n\nProject Goals:\n' + proposal.goals
              }
            ]
          }
        ] : [])
      ],
      techStack: proposal.techStack ? proposal.techStack.split(',').map(tech => tech.trim()) : [],
      skillsNeeded: skillsNeeded.length > 0 ? skillsNeeded : ['Programming', 'Problem Solving'],
      difficultyLevel,
      timeline: proposal.timeline || 'TBD',
      timeCommitment: '3-5 hours/week', // Default value, can be customized
      maxContributors,
      currentContributors: proposal.teamMembers || [],
      requirements: proposal.specialRequests ? [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: proposal.specialRequests
            }
          ]
        }
      ] : [],
      learningOpportunities: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Hands-on experience with real-world project development, collaborative coding practices, and modern development workflows.'
            }
          ]
        }
      ],
      meetingSchedule: 'Weekly team meetings (schedule TBD)',
      communicationChannel: 'Discord (details provided upon acceptance)',
      featured: false,
      originalProposal: {
        _type: 'reference',
        _ref: proposalId
      },
      _originalProposalData: {
        proposerName: proposal.proposerName,
        proposerEmail: proposal.proposerEmail,
        trackingId: proposal.trackingId,
        estimatedBudget: proposal.estimatedBudget,
        fundingSource: proposal.fundingSource
      }
    };

    // Create the active project
    const result = await client.create(activeProjectDoc);

    // Update the original proposal to mark it as converted
    await client.patch(proposalId).set({
      convertedToActiveProject: {
        _type: 'reference',
        _ref: result._id
      },
      conversionDate: new Date().toISOString()
    }).commit();

    // Send notification email to proposer (fire-and-forget)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-conversion-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: proposal.proposerEmail,
        proposerName: proposal.proposerName,
        projectTitle: proposal.projectName,
        projectSlug: slug,
        trackingId: proposal.trackingId
      }),
    }).catch(emailError => {
      console.error('Failed to send conversion notification email:', emailError);
    });

    return NextResponse.json({
      message: 'Proposal successfully converted to active project!',
      activeProjectId: result._id,
      projectSlug: slug,
      projectUrl: `/current-projects/${slug}`
    }, { status: 200 });

  } catch (error) {
    console.error('Conversion Error:', error);
    return NextResponse.json({ 
      message: 'Failed to convert proposal to active project',
      error: error.message 
    }, { status: 500 });
  }
}