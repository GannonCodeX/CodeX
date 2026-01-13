import event from './event'
import member from './member'
import project from './project'
import projectApplication from './projectApplication'
import gallery from './gallery'
import galleryImage from './galleryImage'
import club from './club'
import announcement from './announcement'
import availabilityPoll from './availabilityPoll'
import resourceCategory from './resourceCategory'
import clubResource from './clubResource'
import clubOfficer from './clubOfficer'
import siteSettings from './siteSettings'

export const schemaTypes = [
  // Singleton
  siteSettings,
  // Core
  club,
  member,
  clubOfficer,
  // Content
  event,
  announcement,
  project,
  projectApplication,
  // Media
  gallery,
  galleryImage,
  // Resources
  resourceCategory,
  clubResource,
  // Scheduling
  availabilityPoll,
]

