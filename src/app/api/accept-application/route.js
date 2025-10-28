import { NextResponse } from 'next/server';
import { client } from '../../../sanity/lib/client';

export async function POST(request) {
  try {
    const { applicationId, feedback } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ 
        message: 'Application ID is required' 
      }, { status: 400 });
    }

    // Get the application details
    const application = await client.fetch(
      `*[_type == "projectApplication" && _id == $applicationId][0] {
        _id,
        applicantName,
        applicantEmail,
        project->{
          _id,
          title,
          currentContributors,
          maxContributors
        }
      }`,
      { applicationId }
    );

    if (!application) {
      return NextResponse.json({ 
        message: 'Application not found' 
      }, { status: 404 });
    }

    // Check if project has space
    const currentCount = application.project.currentContributors?.length || 0;
    if (currentCount >= application.project.maxContributors) {
      return NextResponse.json({ 
        message: 'Project team is already full' 
      }, { status: 400 });
    }

    // Create a member record for the applicant if they don't exist
    let memberRef;
    const existingMember = await client.fetch(
      `*[_type == "member" && email == $email][0]`,
      { email: application.applicantEmail }
    );

    if (existingMember) {
      memberRef = { _type: 'reference', _ref: existingMember._id };
    } else {
      // Create new member record
      const newMember = await client.create({
        _type: 'member',
        name: application.applicantName,
        email: application.applicantEmail,
        role: 'Contributor',
        joinDate: new Date().toISOString(),
        isActive: true
      });
      memberRef = { _type: 'reference', _ref: newMember._id };
    }

    // Update application status
    await client.patch(applicationId)
      .set({
        status: 'accepted',
        reviewDate: new Date().toISOString(),
        feedbackToApplicant: feedback ? [
          {
            _type: 'block',
            children: [{ _type: 'span', text: feedback }]
          }
        ] : [
          {
            _type: 'block',
            children: [{ 
              _type: 'span', 
              text: 'Congratulations! Your application has been accepted. The project manager will contact you soon with next steps.' 
            }]
          }
        ]
      })
      .commit();

    // Add member to project team
    await client.patch(application.project._id)
      .setIfMissing({ currentContributors: [] })
      .append('currentContributors', [memberRef])
      .commit();

    // Send acceptance email
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-acceptance-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: application.applicantEmail,
        applicantName: application.applicantName,
        projectTitle: application.project.title,
        feedback: feedback
      }),
    }).catch(emailError => {
      console.error('Failed to send acceptance email:', emailError);
    });

    return NextResponse.json({
      message: 'Application accepted successfully!',
      memberAdded: true,
      newTeamSize: currentCount + 1
    }, { status: 200 });

  } catch (error) {
    console.error('Accept Application Error:', error);
    return NextResponse.json({ 
      message: 'Failed to accept application',
      error: error.message 
    }, { status: 500 });
  }
}