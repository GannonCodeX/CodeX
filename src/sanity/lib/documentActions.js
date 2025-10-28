// src/sanity/lib/documentActions.js
import { useState } from 'react'

// Convert Proposal to Active Project Action
export function ConvertToActiveProjectAction(props) {
  const { type, id, draft, onComplete } = props
  const [isConverting, setIsConverting] = useState(false)

  // Only show for approved proposals that haven't been converted
  if (
    type !== 'projectProposal' || 
    draft?.status !== 'approved' || 
    draft?.convertedToActiveProject
  ) {
    return null
  }

  const handleConvert = async () => {
    setIsConverting(true)
    
    try {
      const response = await fetch('/api/convert-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: id,
          maxContributors: 5,
          skillsNeeded: ['Programming', 'Problem Solving'],
          difficultyLevel: 'intermediate'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message)
      }

      // Show success message
      alert(`✅ Success! Created active project: ${result.projectUrl}`)
      
      // Refresh the document
      if (onComplete) {
        onComplete()
      }

    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setIsConverting(false)
    }
  }

  return {
    label: isConverting ? 'Converting...' : 'Convert to Active Project',
    icon: () => '🚀',
    disabled: isConverting,
    onHandle: handleConvert,
    shortcut: 'ctrl+shift+c'
  }
}

// Accept Application Action
export function AcceptApplicationAction(props) {
  const { type, id, draft, onComplete } = props
  const [isAccepting, setIsAccepting] = useState(false)

  // Only show for pending/reviewing applications
  if (
    type !== 'projectApplication' || 
    (draft?.status !== 'pending' && draft?.status !== 'reviewing')
  ) {
    return null
  }

  const handleAccept = async () => {
    const feedback = prompt('Optional feedback for the applicant:', 
      'Congratulations! Your application has been accepted. The project manager will contact you soon with next steps.')
    
    if (feedback === null) return // User cancelled

    setIsAccepting(true)
    
    try {
      const response = await fetch('/api/accept-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: id,
          feedback: feedback
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message)
      }

      alert(`✅ Application accepted! ${result.memberAdded ? 'Member added to team.' : ''}`)
      
      if (onComplete) {
        onComplete()
      }

    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setIsAccepting(false)
    }
  }

  return {
    label: isAccepting ? 'Accepting...' : 'Accept Application',
    icon: () => '✅',
    disabled: isAccepting,
    onHandle: handleAccept,
    shortcut: 'ctrl+shift+a'
  }
}

// Reject Application Action  
export function RejectApplicationAction(props) {
  const { type, id, draft, onComplete } = props
  const [isRejecting, setIsRejecting] = useState(false)

  // Only show for pending/reviewing applications
  if (
    type !== 'projectApplication' || 
    (draft?.status !== 'pending' && draft?.status !== 'reviewing')
  ) {
    return null
  }

  const handleReject = async () => {
    const feedback = prompt('Optional feedback for the applicant:', 
      'Thank you for your interest in this project. While we cannot offer you a position at this time, we encourage you to apply to other projects!')
    
    if (feedback === null) return // User cancelled

    setIsRejecting(true)
    
    try {
      // Update via Sanity client
      const { getClient } = await import('../lib/client')
      const client = getClient()
      
      await client.patch(id)
        .set({
          status: 'rejected',
          reviewDate: new Date().toISOString(),
          feedbackToApplicant: feedback ? [
            {
              _type: 'block',
              children: [{ _type: 'span', text: feedback }]
            }
          ] : []
        })
        .commit()

      alert('❌ Application rejected. Applicant will be notified.')
      
      if (onComplete) {
        onComplete()
      }

    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setIsRejecting(false)
    }
  }

  return {
    label: isRejecting ? 'Rejecting...' : 'Reject Application',
    icon: () => '❌',
    disabled: isRejecting,
    onHandle: handleReject,
    shortcut: 'ctrl+shift+r'
  }
}