'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './apply.module.css';

const ProjectApplicationForm = ({ project }) => {
  const [status, setStatus] = useState({ loading: false, error: null, success: false, trackingId: null });
  const [portfolioLinks, setPortfolioLinks] = useState([{ type: 'github', url: '', description: '' }]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: null, success: false, trackingId: null });

    const formData = new FormData(event.target);
    
    // Add project ID to form data
    formData.set('projectId', project._id);
    
    // Add portfolio links as JSON
    formData.set('portfolioLinks', JSON.stringify(portfolioLinks.filter(link => link.url.trim())));

    // Get selected skills
    const selectedSkills = [];
    const skillCheckboxes = event.target.querySelectorAll('input[name="relevantSkills"]:checked');
    skillCheckboxes.forEach(checkbox => selectedSkills.push(checkbox.value));
    formData.set('relevantSkills', JSON.stringify(selectedSkills));

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

  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, { type: 'github', url: '', description: '' }]);
  };

  const removePortfolioLink = (index) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const updatePortfolioLink = (index, field, value) => {
    const updated = portfolioLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setPortfolioLinks(updated);
  };

  if (status.success) {
    return (
      <div className={styles.successContainer}>
        <h2 className={styles.successTitle}>Application Submitted!</h2>
        <p className={styles.successMessage}>
          Thank you for applying to {project.title}. We've received your application 
          and will review it carefully.
        </p>
        
        <div className={styles.trackingInfo}>
          <div className={styles.trackingTitle}>Track Your Application</div>
          <div className={styles.trackingId}>{status.trackingId}</div>
          <div className={styles.trackingNote}>
            Save this ID to check your application status
          </div>
        </div>

        <p className={styles.successMessage}>
          You can expect to hear back from the project team within 1-2 weeks. 
          If your application is successful, the project manager will reach out 
          with next steps.
        </p>

        <div className={styles.successActions}>
          <Link href="/current-projects" className={styles.actionButton}>
            Browse More Projects
          </Link>
          <Link 
            href={`/application-status/${status.trackingId}`} 
            className={`${styles.actionButton} ${styles.secondary}`}
          >
            Track Application
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Personal Information */}
      <fieldset className={styles.formSection}>
        <legend className={styles.legend}>Personal Information</legend>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="applicantName" className={styles.label}>
              Full Name <span className={styles.required}>*</span>
            </label>
            <input 
              type="text" 
              id="applicantName" 
              name="applicantName" 
              className={styles.input}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="applicantEmail" className={styles.label}>
              Email Address <span className={styles.required}>*</span>
            </label>
            <input 
              type="email" 
              id="applicantEmail" 
              name="applicantEmail" 
              className={styles.input}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="applicantPhone" className={styles.label}>Phone Number</label>
            <input 
              type="tel" 
              id="applicantPhone" 
              name="applicantPhone" 
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gannonId" className={styles.label}>Gannon ID</label>
            <input 
              type="text" 
              id="gannonId" 
              name="gannonId" 
              className={styles.input}
              placeholder="If you're a Gannon student"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="academicYear" className={styles.label}>Academic Year</label>
            <select id="academicYear" name="academicYear" className={styles.select}>
              <option value="">Select year</option>
              <option value="freshman">Freshman</option>
              <option value="sophomore">Sophomore</option>
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
              <option value="graduate">Graduate Student</option>
              <option value="alumni">Alumni</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="major" className={styles.label}>Major/Field of Study</label>
            <input 
              type="text" 
              id="major" 
              name="major" 
              className={styles.input}
              placeholder="e.g., Computer Science, Engineering"
            />
          </div>
        </div>
      </fieldset>

      {/* Skills & Experience */}
      <fieldset className={styles.formSection}>
        <legend className={styles.legend}>Skills & Experience</legend>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Overall Skill Level <span className={styles.required}>*</span>
          </label>
          <div className={styles.radioGroup}>
            <div className={styles.radioItem}>
              <input type="radio" id="beginner" name="skillLevel" value="beginner" required />
              <label htmlFor="beginner">Beginner</label>
            </div>
            <div className={styles.radioItem}>
              <input type="radio" id="intermediate" name="skillLevel" value="intermediate" required />
              <label htmlFor="intermediate">Intermediate</label>
            </div>
            <div className={styles.radioItem}>
              <input type="radio" id="advanced" name="skillLevel" value="advanced" required />
              <label htmlFor="advanced">Advanced</label>
            </div>
          </div>
        </div>

        {project.skillsNeeded && project.skillsNeeded.length > 0 && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Relevant Skills (select all that apply)
            </label>
            <div className={styles.checkboxGroup}>
              {project.skillsNeeded.map((skill, index) => (
                <div key={index} className={styles.checkboxItem}>
                  <input 
                    type="checkbox" 
                    id={`skill-${index}`} 
                    name="relevantSkills" 
                    value={skill}
                  />
                  <label htmlFor={`skill-${index}`}>{skill}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="experience" className={styles.label}>
            Relevant Experience <span className={styles.required}>*</span>
          </label>
          <textarea 
            id="experience" 
            name="experience" 
            className={styles.textarea}
            placeholder="Describe your relevant experience, projects, coursework, internships, etc."
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="motivation" className={styles.label}>
            Why do you want to join this project? <span className={styles.required}>*</span>
          </label>
          <textarea 
            id="motivation" 
            name="motivation" 
            className={styles.textarea}
            placeholder="What interests you about this project? What do you hope to contribute and learn?"
            required
          />
        </div>
      </fieldset>

      {/* Availability */}
      <fieldset className={styles.formSection}>
        <legend className={styles.legend}>Availability</legend>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="hoursPerWeek" className={styles.label}>
              Hours per week you can commit <span className={styles.required}>*</span>
            </label>
            <select id="hoursPerWeek" name="hoursPerWeek" className={styles.select} required>
              <option value="">Select hours</option>
              <option value="1-3">1-3 hours</option>
              <option value="4-6">4-6 hours</option>
              <option value="7-10">7-10 hours</option>
              <option value="10+">10+ hours</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>
              When can you start? <span className={styles.required}>*</span>
            </label>
            <input 
              type="date" 
              id="startDate" 
              name="startDate" 
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="schedule" className={styles.label}>
            What's your typical availability?
          </label>
          <textarea 
            id="schedule" 
            name="schedule" 
            className={styles.textarea}
            placeholder="e.g., Weekday evenings, Weekend mornings, Flexible schedule, etc."
          />
        </div>
      </fieldset>

      {/* Portfolio Links */}
      <fieldset className={styles.formSection}>
        <legend className={styles.legend}>Portfolio & Links</legend>

        <div className={styles.formGroup}>
          <label className={styles.label}>Portfolio Links</label>
          <div className={styles.linkFields}>
            {portfolioLinks.map((link, index) => (
              <div key={index} className={styles.linkField}>
                <select 
                  className={`${styles.select} ${styles.linkTypeSelect}`}
                  value={link.type}
                  onChange={(e) => updatePortfolioLink(index, 'type', e.target.value)}
                >
                  <option value="github">GitHub</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="behance">Behance</option>
                  <option value="other">Other</option>
                </select>
                <input 
                  type="url" 
                  className={styles.input}
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updatePortfolioLink(index, 'url', e.target.value)}
                />
                {portfolioLinks.length > 1 && (
                  <button 
                    type="button"
                    className={styles.removeLinkButton}
                    onClick={() => removePortfolioLink(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button"
              className={styles.addLinkButton}
              onClick={addPortfolioLink}
            >
              Add Another Link
            </button>
          </div>
        </div>
      </fieldset>

      {/* Project-Specific Questions */}
      <div className={styles.projectQuestions}>
        <h3 className={styles.questionsTitle}>Project-Specific Questions</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="techExperience" className={styles.label}>
            Experience with {project.techStack?.join(', ') || 'the tech stack'}?
          </label>
          <textarea 
            id="techExperience" 
            name="techExperience" 
            className={styles.textarea}
            placeholder="Describe your experience with the technologies used in this project"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="expectations" className={styles.label}>
            What are your expectations for this project?
          </label>
          <textarea 
            id="expectations" 
            name="expectations" 
            className={styles.textarea}
            placeholder="What do you hope to learn or achieve?"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="additionalInfo" className={styles.label}>
            Anything else you'd like us to know?
          </label>
          <textarea 
            id="additionalInfo" 
            name="additionalInfo" 
            className={styles.textarea}
            placeholder="Additional skills, questions, concerns, etc."
          />
        </div>
      </div>

      <div className={styles.submissionSection}>
        <button type="submit" className={styles.submitButton} disabled={status.loading}>
          {status.loading ? 'Submitting Application...' : 'Submit Application'}
        </button>
        
        {status.error && (
          <div className={styles.errorMessage}>
            {status.error}
          </div>
        )}
        
        <p style={{ color: 'var(--subtle-gray)', fontSize: '0.9rem', marginTop: '1rem' }}>
          By submitting this application, you agree to be contacted by the project team 
          regarding your application status.
        </p>
      </div>
    </form>
  );
};

export default ProjectApplicationForm;