import { NextResponse } from 'next/server';
import { client } from '../../../sanity/lib/client';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const trackingId = crypto.randomUUID();

    // Parse JSON fields
    const portfolioLinks = JSON.parse(formData.get('portfolioLinks') || '[]');
    const relevantSkills = JSON.parse(formData.get('relevantSkills') || '[]');

    // Validate required fields
    const projectId = formData.get('projectId');
    const applicantName = formData.get('applicantName');
    const applicantEmail = formData.get('applicantEmail');
    const skillLevel = formData.get('skillLevel');
    const experience = formData.get('experience');
    const motivation = formData.get('motivation');
    const hoursPerWeek = formData.get('hoursPerWeek');
    const startDate = formData.get('startDate');

    if (!projectId || !applicantName || !applicantEmail || !skillLevel || !experience || !motivation || !hoursPerWeek || !startDate) {
      return NextResponse.json({ 
        message: 'Missing required fields. Please fill out all required information.' 
      }, { status: 400 });
    }

    // Verify the project exists and is accepting applications
    const project = await client.fetch(
      `*[_type == "activeProject" && _id == $projectId][0] {
        _id,
        title,
        status,
        maxContributors,
        currentContributors[]->{_id},
        applicationDeadline
      }`,
      { projectId }
    );

    if (!project) {
      return NextResponse.json({ 
        message: 'Project not found.' 
      }, { status: 404 });
    }

    // Check if project is still accepting applications
    const spotsLeft = project.maxContributors - (project.currentContributors?.length || 0);
    const isPastDeadline = project.applicationDeadline && 
      new Date(project.applicationDeadline) < new Date();

    if (project.status !== 'seeking-contributors' || spotsLeft <= 0 || isPastDeadline) {
      return NextResponse.json({ 
        message: 'This project is no longer accepting applications.' 
      }, { status: 400 });
    }

    // Create application document
    const applicationDoc = {
      _type: 'projectApplication',
      trackingId,
      status: 'pending',
      project: {
        _type: 'reference',
        _ref: projectId,
      },
      applicantName,
      applicantEmail,
      applicantPhone: formData.get('applicantPhone') || null,
      gannonId: formData.get('gannonId') || null,
      academicInfo: {
        year: formData.get('academicYear') || null,
        major: formData.get('major') || null,
        gpa: formData.get('gpa') ? Number(formData.get('gpa')) : null,
      },
      skillLevel,
      relevantSkills,
      experience,
      motivation,
      availability: {
        hoursPerWeek,
        schedule: formData.get('schedule') || null,
        startDate: new Date(startDate).toISOString(),
      },
      portfolioLinks: portfolioLinks.filter(link => link.url?.trim()),
      questionsAnswers: [
        {
          question: `Experience with ${project.title} tech stack`,
          answer: formData.get('techExperience') || '',
        },
        {
          question: 'Project expectations',
          answer: formData.get('expectations') || '',
        },
        {
          question: 'Additional information',
          answer: formData.get('additionalInfo') || '',
        },
      ].filter(qa => qa.answer.trim()),
      applicationDate: new Date().toISOString(),
    };

    // Create the application in Sanity
    const result = await client.create(applicationDoc);

    // Send confirmation email (fire-and-forget)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-application-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: applicantEmail,
        applicantName,
        projectTitle: project.title,
        trackingId,
      }),
    }).catch(emailError => {
      console.error('Failed to trigger application confirmation email:', emailError);
    });

    return NextResponse.json({
      message: 'Application submitted successfully!',
      trackingId,
      applicationId: result._id,
    }, { status: 200 });

  } catch (error) {
    console.error('Application Submission Error:', error);
    return NextResponse.json({ 
      message: 'Failed to submit application. Please try again later.',
      error: error.message 
    }, { status: 500 });
  }
}