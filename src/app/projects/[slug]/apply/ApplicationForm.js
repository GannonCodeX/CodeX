'use client';

import { useState } from 'react';
import styles from './apply.module.css';

const ApplicationForm = ({ project, projectSlug }) => {
  const [status, setStatus] = useState({ loading: false, error: null, success: false, trackingId: null });
  const [formErrors, setFormErrors] = useState({});

  const getFieldError = (fieldName) => {
    return formErrors[fieldName] ? (
      <span className={styles.errorText}>{formErrors[fieldName]}</span>
    ) : null;
  };

  const getFieldClassName = (fieldName) => {
    return formErrors[fieldName] ? `${styles.input} ${styles.inputError}` : styles.input;
  };

  const validateForm = (formData) => {
    const errors = {};
    
    // Required field validation
    const requiredFields = {
      'applicantName': 'Full Name',
      'applicantEmail': 'Email Address',
      'skillLevel': 'Skill Level',
      'experience': 'Relevant Experience',
      'motivation': 'Why do you want to join this project',
      'hoursPerWeek': 'Available Hours per Week',
      'startDate': 'When can you start'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData.get(field)?.trim()) {
        errors[field] = `${label} is required`;
      }
    });

    // Email validation
    const email = formData.get('applicantEmail');
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.applicantEmail = 'Please enter a valid email address';
      }
    }

    // URL validation for portfolio links
    const urlFields = ['githubLink', 'portfolioLink', 'linkedinLink'];
    urlFields.forEach(field => {
      const url = formData.get(field);
      if (url && url.trim()) {
        try {
          new URL(url);
        } catch {
          errors[field] = 'Please enter a valid URL (including http:// or https://)';
        }
      }
    });

    // Experience length validation
    const experience = formData.get('experience');
    if (experience && experience.length < 20) {
      errors.experience = 'Please provide more detail about your experience (at least 20 characters)';
    }

    // Motivation length validation
    const motivation = formData.get('motivation');
    if (motivation && motivation.length < 20) {
      errors.motivation = 'Please provide more detail about your motivation (at least 20 characters)';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormErrors({});
    setStatus({ loading: true, error: null, success: false, trackingId: null });

    const formData = new FormData(event.target);
    
    // Client-side validation
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setStatus({ loading: false, error: 'Please correct the errors below', success: false, trackingId: null });
      return;
    }
    
    // Add project ID to form data
    formData.set('projectId', project._id);

    // Parse skills into array
    const skillsInput = formData.get('relevantSkills');
    const skillsArray = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    formData.set('relevantSkills', JSON.stringify(skillsArray));

    // Parse portfolio links
    const portfolioLinks = [];
    const githubLink = formData.get('githubLink');
    const portfolioLink = formData.get('portfolioLink');
    const linkedinLink = formData.get('linkedinLink');
    
    if (githubLink) portfolioLinks.push({ type: 'github', url: githubLink, description: 'GitHub Profile' });
    if (portfolioLink) portfolioLinks.push({ type: 'portfolio', url: portfolioLink, description: 'Portfolio Website' });
    if (linkedinLink) portfolioLinks.push({ type: 'linkedin', url: linkedinLink, description: 'LinkedIn Profile' });
    
    formData.set('portfolioLinks', JSON.stringify(portfolioLinks));

    try {
      const response = await fetch('/api/submit-project-application', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      setStatus({ loading: false, error: null, success: true, trackingId: result.trackingId });
      event.target.reset();

    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false, trackingId: null });
    }
  };

  if (status.success) {
    const statusUrl = `${window.location.origin}/application-status/${status.trackingId}`;
    return (
      <div className={styles.successContainer}>
        <h3 className={styles.successTitle}>Application Submitted! 🎉</h3>
        <p>Thank you for applying to join <strong>{project.title}</strong>!</p>
        <p>The project proposer will review your application and get back to you soon.</p>
        <div className={styles.trackingInfo}>
          <p className={styles.trackingLabel}>Track your application status:</p>
          <div className={styles.linkContainer}>
            <a href={statusUrl} target="_blank" rel="noopener noreferrer" className={styles.trackingLink}>
              {statusUrl}
            </a>
          </div>
          <p className={styles.saveNote}>💡 Save this link to check your application status</p>
        </div>
        <button 
          className={styles.button} 
          onClick={() => window.location.href = `/projects/${projectSlug}`}
        >
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Personal Information</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="applicantName" className={styles.label}>
            Full Name *
          </label>
          <input 
            type="text" 
            id="applicantName" 
            name="applicantName" 
            className={getFieldClassName('applicantName')} 
            placeholder="John Doe"
            required 
          />
          {getFieldError('applicantName')}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="applicantEmail" className={styles.label}>
            Email Address *
          </label>
          <input 
            type="email" 
            id="applicantEmail" 
            name="applicantEmail" 
            className={getFieldClassName('applicantEmail')} 
            placeholder="john.doe@example.com"
            required 
          />
          {getFieldError('applicantEmail')}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="applicantPhone" className={styles.label}>
              Phone Number
            </label>
            <input 
              type="tel" 
              id="applicantPhone" 
              name="applicantPhone" 
              className={styles.input} 
              placeholder="(555) 123-4567"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gannonId" className={styles.label}>
              Gannon ID
            </label>
            <input 
              type="text" 
              id="gannonId" 
              name="gannonId" 
              className={styles.input} 
              placeholder="Student/Staff ID"
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="academicYear" className={styles.label}>
              Academic Status
            </label>
            <select id="academicYear" name="academicYear" className={styles.input}>
              <option value="">Select status</option>
              <option value="freshman">Freshman</option>
              <option value="sophomore">Sophomore</option>
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
              <option value="graduate">Graduate Student</option>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
              <option value="alumni">Alumni</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="major" className={styles.label}>
              Major/Department
            </label>
            <input 
              type="text" 
              id="major" 
              name="major" 
              className={styles.input} 
              placeholder="Computer Science"
            />
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Experience & Skills</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="skillLevel" className={styles.label}>
            Overall Skill Level *
          </label>
          <select id="skillLevel" name="skillLevel" className={getFieldClassName('skillLevel')} required>
            <option value="">Select your level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {getFieldError('skillLevel')}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="relevantSkills" className={styles.label}>
            Relevant Skills
          </label>
          <input 
            type="text" 
            id="relevantSkills" 
            name="relevantSkills" 
            className={styles.input} 
            placeholder="JavaScript, React, Python, UI Design (comma-separated)"
          />
          <small className={styles.helpText}>List skills relevant to this project, separated by commas</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="experience" className={styles.label}>
            Relevant Experience *
          </label>
          <textarea 
            id="experience" 
            name="experience" 
            className={formErrors.experience ? `${styles.textarea} ${styles.inputError}` : styles.textarea} 
            placeholder="Describe your relevant experience, previous projects, coursework, internships, etc."
            rows="4"
            required
          ></textarea>
          {getFieldError('experience')}
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Motivation & Availability</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="motivation" className={styles.label}>
            Why do you want to join this project? *
          </label>
          <textarea 
            id="motivation" 
            name="motivation" 
            className={formErrors.motivation ? `${styles.textarea} ${styles.inputError}` : styles.textarea} 
            placeholder="What interests you about this project? What do you hope to learn or contribute?"
            rows="4"
            required
          ></textarea>
          {getFieldError('motivation')}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="hoursPerWeek" className={styles.label}>
              Available Hours per Week *
            </label>
            <select id="hoursPerWeek" name="hoursPerWeek" className={getFieldClassName('hoursPerWeek')} required>
              <option value="">Select hours</option>
              <option value="1-3 hours">1-3 hours</option>
              <option value="4-6 hours">4-6 hours</option>
              <option value="7-10 hours">7-10 hours</option>
              <option value="10+ hours">10+ hours</option>
              <option value="flexible">Flexible</option>
            </select>
            {getFieldError('hoursPerWeek')}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>
              When can you start? *
            </label>
            <input 
              type="date" 
              id="startDate" 
              name="startDate" 
              className={getFieldClassName('startDate')} 
              required 
            />
            {getFieldError('startDate')}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="schedule" className={styles.label}>
            Preferred Schedule
          </label>
          <textarea 
            id="schedule" 
            name="schedule" 
            className={styles.textarea} 
            placeholder="When are you typically available? (e.g., weekday evenings, weekend mornings, etc.)"
            rows="2"
          ></textarea>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Portfolio & Links</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="githubLink" className={styles.label}>
            GitHub Profile
          </label>
          <input 
            type="url" 
            id="githubLink" 
            name="githubLink" 
            className={getFieldClassName('githubLink')} 
            placeholder="https://github.com/yourusername"
          />
          {getFieldError('githubLink')}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="portfolioLink" className={styles.label}>
            Portfolio Website
          </label>
          <input 
            type="url" 
            id="portfolioLink" 
            name="portfolioLink" 
            className={getFieldClassName('portfolioLink')} 
            placeholder="https://yourportfolio.com"
          />
          {getFieldError('portfolioLink')}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="linkedinLink" className={styles.label}>
            LinkedIn Profile
          </label>
          <input 
            type="url" 
            id="linkedinLink" 
            name="linkedinLink" 
            className={getFieldClassName('linkedinLink')} 
            placeholder="https://linkedin.com/in/yourprofile"
          />
          {getFieldError('linkedinLink')}
        </div>
      </div>

      {project.customQuestions && project.customQuestions.length > 0 && (
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Project-Specific Questions</h3>
          {project.customQuestions.map((question, index) => (
            <div key={index} className={styles.formGroup}>
              <label htmlFor={`customQuestion${index}`} className={styles.label}>
                {question}
              </label>
              <textarea 
                id={`customQuestion${index}`}
                name={`customQuestion${index}`}
                className={styles.textarea} 
                rows="3"
              ></textarea>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.submitSection}>
        <button 
          type="submit" 
          className={`${styles.submitButton} ${status.loading ? styles.loading : ''}`} 
          disabled={status.loading}
        >
          {status.loading ? 'Submitting...' : 'Submit Application'}
        </button>
        {status.error && <p className={styles.errorMessage}>{status.error}</p>}
      </div>
    </form>
  );
};

export default ApplicationForm;