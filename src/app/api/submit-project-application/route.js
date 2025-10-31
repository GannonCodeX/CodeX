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

    // Enhanced validation with specific field checks
    const missingFields = [];
    if (!projectId) missingFields.push('Project ID');
    if (!applicantName) missingFields.push('Full Name');
    if (!applicantEmail) missingFields.push('Email Address');
    if (!skillLevel) missingFields.push('Skill Level');
    if (!experience) missingFields.push('Relevant Experience');
    if (!motivation) missingFields.push('Motivation');
    if (!hoursPerWeek) missingFields.push('Available Hours per Week');
    if (!startDate) missingFields.push('Start Date');

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        message: `Please fill out the following required fields: ${missingFields.join(', ')}`,
        missingFields
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      return NextResponse.json({ 
        message: 'Please enter a valid email address.',
        field: 'applicantEmail'
      }, { status: 400 });
    }

    // Verify the project exists and is accepting applications
    const project = await client.fetch(
      `*[_type == "project" && _id == $projectId][0] {
        _id,
        title,
        status,
        maxContributors,
        currentContributors[]->{_id},
        applicationDeadline,
        proposerEmail
      }`,
      { projectId }
    );

    if (!project) {
      return NextResponse.json({ 
        message: 'Project not found. The project may have been removed or the link may be invalid.',
        code: 'PROJECT_NOT_FOUND'
      }, { status: 404 });
    }

    // Check if project is still accepting applications
    const currentContributorCount = project.currentContributors?.length || 0;
    const spotsLeft = project.maxContributors - currentContributorCount;
    const isPastDeadline = project.applicationDeadline && 
      new Date(project.applicationDeadline) < new Date();

    if (project.status !== 'active-seeking') {
      const statusMessages = {
        'draft': 'This project is still in draft mode.',
        'proposed': 'This project is under review and not yet accepting applications.',
        'active-progress': 'This project is no longer accepting new applications as it is already in progress.',
        'completed': 'This project has been completed and is no longer accepting applications.',
        'archived': 'This project has been archived and is no longer accepting applications.'
      };
      
      return NextResponse.json({ 
        message: statusMessages[project.status] || 'This project is not currently accepting applications.',
        projectStatus: project.status,
        code: 'NOT_ACCEPTING_APPLICATIONS'
      }, { status: 400 });
    }

    if (spotsLeft <= 0) {
      return NextResponse.json({ 
        message: `This project has reached its maximum capacity of ${project.maxContributors} contributors.`,
        maxContributors: project.maxContributors,
        currentCount: currentContributorCount,
        code: 'MAX_CONTRIBUTORS_REACHED'
      }, { status: 400 });
    }

    if (isPastDeadline) {
      return NextResponse.json({ 
        message: `The application deadline for this project was ${new Date(project.applicationDeadline).toLocaleDateString()}.`,
        deadline: project.applicationDeadline,
        code: 'DEADLINE_PASSED'
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

    // Send confirmation email to applicant (fire-and-forget)
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

    // Notify project proposer (fire-and-forget)
    if (project.proposerEmail) {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: project.proposerEmail,
          proposerName: 'Project Proposer',
          projectName: project.title,
          trackingId: `new-application-${trackingId}`,
          subject: `New Application for ${project.title}`,
          customMessage: `You have received a new application for your project "${project.title}" from ${applicantName}.`
        }),
      }).catch(emailError => {
        console.error('Failed to notify proposer:', emailError);
      });
    }

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