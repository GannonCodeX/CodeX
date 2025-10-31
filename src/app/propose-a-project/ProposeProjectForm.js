'use client';

import { useState } from 'react';
import styles from './propose.module.css';
import MemberSelect from '../components/MemberSelect';

const ProposeProjectForm = ({ members }) => {
  const [status, setStatus] = useState({ loading: false, error: null, success: false, trackingId: null });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: null, success: false, trackingId: null });

    const formData = new FormData(event.target);
    const selectedMemberIds = formData.get('teamMemberIds');
    formData.set('teamMemberIds', selectedMemberIds);

    try {
      const response = await fetch('/api/submit-proposal', {
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
    const statusUrl = `${window.location.origin}/proposal-status/${status.trackingId}`;
    return (
      <div className={styles.successContainer}>
        <h2 className={styles.successTitle}>Proposal Submitted!</h2>
        <p>Thank you for your submission. You can track its status using the private link below.</p>
        <p className={styles.importantText}>Please copy and save this link. You will not be able to retrieve it again.</p>
        <div className={styles.linkContainer}>
          <a href={statusUrl} target="_blank" rel="noopener noreferrer">{statusUrl}</a>
        </div>
        <button className={styles.submitButton} onClick={() => window.location.reload()}>Submit Another</button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <fieldset className={styles.formSection}>
        <legend className={styles.legend}>Project Details</legend>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="projectName" className={styles.label}>Project Name</label>
          <input type="text" id="projectName" name="projectName" className={styles.input} placeholder="e.g., Campus Navigator App" required />
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="description" className={styles.label}>Project Description</label>
          <textarea id="description" name="description" className={styles.textarea} placeholder="Describe the project in detail..." required></textarea>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="techStack" className={styles.label}>Proposed Tech Stack</label>
          <input type="text" id="techStack" name="techStack" className={styles.input} placeholder="e.g., Next.js, Python, Firebase" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="timeline" className={styles.label}>Estimated Timeline</label>
          <input type="text" id="timeline" name="timeline" className={styles.input} placeholder="e.g., 1-2 months, Semester-long" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="difficultyLevel" className={styles.label}>Difficulty Level</label>
          <select id="difficultyLevel" name="difficultyLevel" className={styles.input}>
            <option value="">Select difficulty</option>
            <option value="beginner">Beginner Friendly</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="timeCommitment" className={styles.label}>Time Commitment</label>
          <select id="timeCommitment" name="timeCommitment" className={styles.input}>
            <option value="">Select time commitment</option>
            <option value="1-3">1-3 hours/week</option>
            <option value="4-6">4-6 hours/week</option>
            <option value="7-10">7-10 hours/week</option>
            <option value="10+">10+ hours/week</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="maxContributors" className={styles.label}>Maximum Contributors</label>
          <input type="number" id="maxContributors" name="maxContributors" className={styles.input} placeholder="e.g., 5" min="1" max="20" />
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="skillsNeeded" className={styles.label}>Skills Needed</label>
          <input type="text" id="skillsNeeded" name="skillsNeeded" className={styles.input} placeholder="e.g., JavaScript, UI Design, Database" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="mainImage" className={styles.label}>Project Image</label>
          <input type="file" id="mainImage" name="mainImage" className={styles.fileInput} accept="image/*" />
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="goals" className={styles.label}>Project Goals & Success Metrics</label>
          <textarea 
            id="goals" 
            name="goals" 
            className={styles.textarea} 
            placeholder="Define specific objectives, success metrics, and deliverables. You can use Markdown formatting."
            rows="6"
          ></textarea>
          <small className={styles.helpText}>💡 Supports Markdown: **bold**, *italic*, lists, links, etc.</small>
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend className={styles.legend}>Finance & Resources</legend>
        <div className={styles.formGroup}>
          <label htmlFor="estimatedBudget" className={styles.label}>Estimated Budget ($)</label>
          <input type="number" id="estimatedBudget" name="estimatedBudget" className={styles.input} placeholder="e.g., 500" min="0" />
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Funding Source</label>
          <div className={styles.radioGrid}>
            <div className={styles.radioItem}>
              <input type="radio" id="seeking" name="funding" value="Seeking Club Funding" />
              <label htmlFor="seeking">Seeking Club Funding</label>
            </div>
            <div className={styles.radioItem}>
              <input type="radio" id="personal" name="funding" value="Personal" />
              <label htmlFor="personal">Personal</label>
            </div>
            <div className={styles.radioItem}>
              <input type="radio" id="na" name="funding" value="N/A" />
              <label htmlFor="na">N/A</label>
            </div>
          </div>
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="budgetBreakdown" className={styles.label}>Budget Breakdown</label>
          <textarea 
            id="budgetBreakdown" 
            name="budgetBreakdown" 
            className={styles.textarea} 
            placeholder="List budget items with costs and justifications. You can create tables using Markdown format."
            rows="8"
          ></textarea>
          <small className={styles.helpText}>💡 Create tables: | Item | Cost | Notes |</small>
        </div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label htmlFor="specialRequests" className={styles.label}>Special Requests</label>
          <textarea 
            id="specialRequests" 
            name="specialRequests" 
            className={styles.textarea} 
            placeholder="Any special hardware access, mentorship needs, timeline constraints, etc."
            rows="6"
          ></textarea>
          <small className={styles.helpText}>💡 Supports Markdown formatting</small>
        </div>
      </fieldset>

      <fieldset className={styles.formSection}>
        <legend className={styles.legend}>Team & Presentation</legend>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.label}>Proposed Team Members</label>
          <MemberSelect members={members} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="presentation" className={styles.label}>Upload Presentation (PPT/PDF)</label>
          <input type="file" id="presentation" name="presentation" className={styles.fileInput} accept=".ppt, .pptx, .pdf" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="presentationTime" className={styles.label}>Book Presentation Slot</label>
          <input type="datetime-local" id="presentationTime" name="presentationTime" className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Your Name</label>
          <input type="text" id="name" name="name" className={styles.input} placeholder="John Doe" required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Your Email</label>
          <input type="email" id="email" name="email" className={styles.input} placeholder="john.doe@example.com" required />
        </div>
      </fieldset>
      
      <div className={styles.submissionStatus}>
        <button type="submit" className={styles.submitButton} disabled={status.loading}>
          {status.loading ? 'Submitting...' : 'Submit Proposal'}
        </button>
        {status.error && <p className={styles.errorMessage}>{status.error}</p>}
      </div>
    </form>
  );
};

export default ProposeProjectForm;