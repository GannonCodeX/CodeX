// src/sanity/lib/actions/reviewApplication.js
export const acceptApplicationAction = {
  name: 'acceptApplication',
  title: 'Accept Application',
  icon: () => '✅',
  condition: (props) => {
    return props.draft?.status === 'pending' || props.draft?.status === 'reviewing'
  },
  execute: async (props, context) => {
    const { getClient } = context
    const client = getClient({ apiVersion: '2023-01-01' })
    
    try {
      // Update application status
      await client.patch(props.id)
        .set({
          status: 'accepted',
          reviewDate: new Date().toISOString(),
          feedbackToApplicant: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: 'Congratulations! Your application has been accepted. The project manager will contact you soon with next steps.'
                }
              ]
            }
          ]
        })
        .commit()

      // TODO: Add applicant to project team automatically
      // TODO: Send acceptance email

      context.toast.push({
        status: 'success',
        title: 'Application Accepted!',
        description: 'Applicant will be notified via email.'
      })

      return { type: 'success' }

    } catch (error) {
      context.toast.push({
        status: 'error',
        title: 'Failed to Accept Application',
        description: error.message
      })
      
      return { type: 'error', message: error.message }
    }
  }
}

export const rejectApplicationAction = {
  name: 'rejectApplication',
  title: 'Reject Application',
  icon: () => '❌',
  condition: (props) => {
    return props.draft?.status === 'pending' || props.draft?.status === 'reviewing'
  },
  execute: async (props, context) => {
    const { getClient } = context
    const client = getClient({ apiVersion: '2023-01-01' })
    
    try {
      await client.patch(props.id)
        .set({
          status: 'rejected',
          reviewDate: new Date().toISOString(),
          feedbackToApplicant: [
            {
              _type: 'block',
              children: [
                {
                  _type: 'span',
                  text: 'Thank you for your interest in this project. While we cannot offer you a position at this time, we encourage you to apply to other projects or propose your own!'
                }
              ]
            }
          ]
        })
        .commit()

      context.toast.push({
        status: 'success',
        title: 'Application Rejected',
        description: 'Applicant will be notified via email.'
      })

      return { type: 'success' }

    } catch (error) {
      context.toast.push({
        status: 'error',
        title: 'Failed to Reject Application',
        description: error.message
      })
      
      return { type: 'error', message: error.message }
    }
  }
}