import { NextResponse } from 'next/server';
import { client } from '../../../sanity/lib/client';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const presentationFile = formData.get('presentation');
    const mainImageFile = formData.get('mainImage');
    const teamMemberIds = formData.get('teamMemberIds')?.split(',');
    const skillsArray = formData.get('skillsNeeded')?.split(',').map(s => s.trim()).filter(Boolean);
    const trackingId = crypto.randomUUID(); // Generate a unique ID

    let presentationAsset;
    if (presentationFile && presentationFile.size > 0) {
      presentationAsset = await client.assets.upload('file', presentationFile);
    }

    let mainImageAsset;
    if (mainImageFile && mainImageFile.size > 0) {
      mainImageAsset = await client.assets.upload('image', mainImageFile);
    }

    // Create project description in rich text format
    const descriptionBlocks = [{
      _type: 'block',
      _key: 'description',
      style: 'normal',
      children: [{
        _type: 'span',
        _key: 'span1',
        text: formData.get('description'),
        marks: []
      }]
    }];

    // Add goals as a separate block if provided
    if (formData.get('goals')) {
      descriptionBlocks.push({
        _type: 'block',
        _key: 'goals',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'goalstitle',
          text: 'Project Goals',
          marks: []
        }]
      });
      descriptionBlocks.push({
        _type: 'block',
        _key: 'goalstext',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'goalsspan',
          text: formData.get('goals'),
          marks: []
        }]
      });
    }

    const projectDoc = {
      _type: 'project',
      trackingId,
      status: 'proposed',
      title: formData.get('projectName'),
      slug: {
        _type: 'slug',
        current: formData.get('projectName').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      },
      description: descriptionBlocks,
      excerpt: formData.get('description').substring(0, 200) + '...',
      proposerName: formData.get('name'),
      proposerEmail: formData.get('email'),
      techStack: formData.get('techStack'),
      timeline: formData.get('timeline'),
      difficultyLevel: formData.get('difficultyLevel'),
      timeCommitment: formData.get('timeCommitment'),
      maxContributors: formData.get('maxContributors') ? Number(formData.get('maxContributors')) : null,
      skillsNeeded: skillsArray,
      presentationTime: formData.get('presentationTime') ? new Date(formData.get('presentationTime')).toISOString() : undefined,
      // Legacy fields for backward compatibility
      goals: formData.get('goals'),
      estimatedBudget: Number(formData.get('estimatedBudget')) || 0,
      fundingSource: formData.get('funding'),
      budgetBreakdown: formData.get('budgetBreakdown'),
      specialRequests: formData.get('specialRequests'),
      ...(mainImageAsset && {
        mainImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: mainImageAsset._id,
          },
        },
      }),
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

    await client.create(projectDoc);

    // Fire-and-forget call to the email API
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: projectDoc.proposerEmail,
        proposerName: projectDoc.proposerName,
        projectName: projectDoc.title,
        trackingId: projectDoc.trackingId,
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
