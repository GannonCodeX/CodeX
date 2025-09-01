import { NextResponse } from 'next/server';
import { client } from '../../../sanity/lib/client';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const presentationFile = formData.get('presentation');
    const teamMemberIds = formData.get('teamMemberIds')?.split(',');
    const trackingId = crypto.randomUUID(); // Generate a unique ID

    let presentationAsset;
    if (presentationFile && presentationFile.size > 0) {
      presentationAsset = await client.assets.upload('file', presentationFile);
    }

    const proposalDoc = {
      _type: 'projectProposal',
      trackingId, // Add the new ID to the document
      status: 'pending',
      proposerName: formData.get('name'),
      proposerEmail: formData.get('email'),
      projectName: formData.get('projectName'),
      description: formData.get('description'),
      techStack: formData.get('techStack'),
      timeline: formData.get('timeline'),
      goals: formData.get('goals'),
      estimatedBudget: Number(formData.get('estimatedBudget')) || 0,
      fundingSource: formData.get('funding'),
      budgetBreakdown: formData.get('budgetBreakdown'),
      specialRequests: formData.get('specialRequests'),
      presentationTime: formData.get('presentationTime') ? new Date(formData.get('presentationTime')).toISOString() : undefined,
      ...(presentationAsset && {
        presentation: {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: presentationAsset._id,
          },
        },
      }),
      ...(teamMemberIds && teamMemberIds.length > 0 && {
        teamMembers: teamMemberIds.map(id => ({
          _type: 'reference',
          _ref: id,
          _key: id,
        })),
      }),
    };

    await client.create(proposalDoc);

    // Fire-and-forget call to the email API
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: proposalDoc.proposerEmail,
        proposerName: proposalDoc.proposerName,
        projectName: proposalDoc.projectName,
        trackingId: proposalDoc.trackingId,
      }),
    }).catch(emailError => {
      // Log the error, but don't block the user response
      console.error('Failed to trigger confirmation email:', emailError);
    });

    return NextResponse.json({
      message: 'Proposal submitted successfully!',
      trackingId: trackingId,
    }, { status: 200 });
  } catch (error) {
    console.error('Submission Error:', error);
    return NextResponse.json({ message: 'Failed to submit proposal.', error: error.message }, { status: 500 });
  }
}
