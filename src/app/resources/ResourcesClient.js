'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { RESOURCE_TYPES, RESOURCE_LEVELS } from '@/lib/resources.mjs'
import { filterResources, filterHackathons, hackathonStatus, upcomingDeadline, formatDate } from './library.mjs'
import styles from './resources.module.css'

const sections = [
  { value: 'learn', label: 'Learn & tools', number: '01' },
  { value: 'hackathons', label: 'Hackathons', number: '02' },
  { value: 'materials', label: 'Club materials', number: '03' },
]

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>
}

export default function ResourcesClient({ resources, hackathons, initialNow, sharedUnavailable }) {
  const [section, setSection] = useState('learn')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('')
  const [status, setStatus] = useState('')
  const [teamOfFour, setTeamOfFour] = useState(false)
  const [now, setNow] = useState(initialNow)

  const resetFilters = useCallback(() => {
    setSearch(''); setType(''); setTopic(''); setLevel(''); setStatus(''); setTeamOfFour(false)
  }, [])

  useEffect(() => {
    const readSection = () => {
      const hash = window.location.hash.slice(1)
      if (sections.some(item => item.value === hash)) { setSection(hash); resetFilters() }
    }
    readSection()
    window.addEventListener('hashchange', readSection)
    const timer = window.setInterval(() => setNow(new Date().toISOString()), 60000)
    return () => { window.removeEventListener('hashchange', readSection); window.clearInterval(timer) }
  }, [resetFilters])

  function changeSection(value) {
    setSection(value)
    resetFilters()
    window.history.replaceState(null, '', `#${value}`)
  }

  const isHackathons = section === 'hackathons'
  const sectionResources = resources.filter(resource => resource.librarySection === section)
  const topics = [...new Set(sectionResources.flatMap(resource => resource.tags))].sort()
  const resourceTypes = RESOURCE_TYPES.filter(format => sectionResources.some(resource => resource.resourceType === format.value))
  const results = filterResources(resources, { section, search, type, topic, level })
  const events = [...hackathons.events, ...hackathons.watch]
  const eventResults = filterHackathons(events, { search, status, teamOfFour, now, checked: hackathons.checked })
  const resultCount = isHackathons ? eventResults.length : results.length
  const hasFilters = !!(search || type || topic || level || status || teamOfFour)
  const starters = ['starter-cs50', 'starter-github', 'starter-mdn'].map(id => resources.find(resource => resource.id === id || resource.starterId === id)).filter(Boolean)

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="resources-heading">
          <div>
            <p className={styles.eyebrow}>{'// THE CODEX RESOURCE LIBRARY'}</p>
            <h1 id="resources-heading">Less searching.<br />More <span>building.</span></h1>
            <p className={styles.intro}>A good place to start, and a better place to keep going. Courses, videos, useful tools, and opportunities for Gannon builders.</p>
            <a className={styles.browseLink} href="#library">Find your next resource <span aria-hidden="true">↓</span></a>
          </div>
          <aside className={styles.starter} aria-labelledby="starter-heading">
            <div className={styles.starterTop}><span className={styles.eyebrow}>{'// START HERE'}</span><span aria-hidden="true">[ + ]</span></div>
            <h2 id="starter-heading">New to this?{' '}<br />You&apos;re in the right place.</h2>
            <p>Three starting points. Pick what you want to learn.</p>
            <ol>
              {starters.map((resource, index) => (
                <li key={resource.id}><a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <span className={styles.step}>0{index + 1}</span>
                  <span>{['Learn to code', 'Work with a team', 'Make a website'][index]}<small>{resource.provider}</small></span>
                  <Arrow diagonal />
                </a></li>
              ))}
            </ol>
          </aside>
        </section>

        <section id="library" className={styles.library} aria-label="Browse the resource library">
          <div className={styles.sectionButtons} role="group" aria-label="Resource collection">
            {sections.map(item => (
              <button key={item.value} type="button" aria-pressed={section === item.value}
                className={`${styles.sectionButton} ${section === item.value ? styles.activeSection : ''}`}
                onClick={() => changeSection(item.value)}>
                <span className={styles.sectionNumber}>{item.number}</span>{item.label}
                <span className={styles.sectionCount}>{item.value === 'hackathons' ? events.length : resources.filter(resource => resource.librarySection === item.value).length}</span>
              </button>
            ))}
          </div>

          <div className={styles.collectionIntro}>
            <div>
              <h2>{isHackathons ? 'Build something. Go somewhere.' : section === 'materials' ? 'Keep the learning going.' : 'Your next “I made that.” starts here.'}</h2>
              <p>{isHackathons ? 'Student hackathons across the US, with application dates and the details your team needs.' : section === 'materials' ? 'Workshop notes, recordings, templates, and project files shared by our clubs.' : 'A small, useful collection. Find something that fits where you are and what you want to build.'}</p>
            </div>
            {isHackathons && <a className={styles.download} href="/resources/GUPC-Hackathon-Applications-2026.xlsx" download>Download Excel <span aria-hidden="true">↓</span><small>Research snapshot · Sep 8, 2026</small></a>}
          </div>

          {isHackathons && <div className={styles.researchNote}>
            <strong>Checked {formatDate(hackathons.checked, { year: 'numeric' })}.</strong> Openings are a dated snapshot. “Check availability” means the form was behind sign-in or needs a fresh check. Confirm with the organizer before arranging travel; teammates may need separate applications.
          </div>}
          {sharedUnavailable && !isHackathons && <p role="status" className={styles.researchNote}>Club resources couldn&apos;t load right now. The starter collection is still available. Refresh to try again.</p>}

          <div className={styles.filters}>
            <label className={styles.searchField}>
              <span>Search {isHackathons ? 'hackathons' : 'resources'}</span>
              <div className={styles.searchInput}><svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
                <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={isHackathons ? 'Name, university, or city...' : 'Try Python, React, or GitHub...'} />
              </div>
            </label>
            {isHackathons ? <>
              <label className={styles.selectField}><span>Application status</span><select aria-label="Application status" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All statuses</option><option value="open">Applications open</option><option value="check">Check availability</option><option value="watch">Watchlist</option><option value="closed">Closed / underway</option><option value="ended">Past events</option>
              </select></label>
              <label className={styles.checkbox}><input type="checkbox" checked={teamOfFour} onChange={e => setTeamOfFour(e.target.checked)} /><span>Fits a team of 4<small>Confirmed team size only</small></span></label>
            </> : <>
              <label className={styles.selectField}><span>Topic</span><select aria-label="Topic" value={topic} onChange={e => setTopic(e.target.value)}><option value="">All topics</option>{topics.map(item => <option key={item}>{item}</option>)}</select></label>
              <label className={styles.selectField}><span>Format</span><select aria-label="Format" value={type} onChange={e => setType(e.target.value)}><option value="">All formats</option>{resourceTypes.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className={styles.selectField}><span>Experience</span><select aria-label="Experience" value={level} onChange={e => setLevel(e.target.value)}><option value="">All levels</option>{RESOURCE_LEVELS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            </>}
          </div>
          <div className={styles.resultBar}>
            <p role="status" aria-live="polite">{resultCount} {isHackathons ? (resultCount === 1 ? 'hackathon' : 'hackathons') : (resultCount === 1 ? 'resource' : 'resources')}{hasFilters ? ' found' : ' to explore'}</p>
            {hasFilters && <button type="button" onClick={resetFilters}>Clear filters <span aria-hidden="true">×</span></button>}
          </div>

          {resultCount > 0 ? isHackathons ? (
            <div className={styles.eventList}>{eventResults.map(event => <HackathonCard key={event.name} event={event} now={now} checked={hackathons.checked} />)}</div>
          ) : (
            <div className={styles.grid}>{results.map(resource => <ResourceCard key={resource.id} resource={resource} />)}</div>
          ) : <div className={styles.empty}>
            <span className={styles.emptySymbol} aria-hidden="true">{hasFilters ? '[ ? ]' : '[ + ]'}</span>
            <h3>{hasFilters ? 'Nothing here with those filters.' : sharedUnavailable ? 'Club materials are temporarily unavailable.' : 'The next workshop lives here.'}</h3>
            <p>{hasFilters ? 'Try another topic or clear your filters to see the full collection.' : sharedUnavailable ? 'Refresh the page to try loading them again.' : 'As clubs share slides, recordings, and project files, you’ll find them in this collection.'}</p>
            {hasFilters ? <button type="button" className={styles.outlineButton} onClick={resetFilters}>Clear filters <Arrow /></button> : <Link className={styles.outlineButton} href="/officer">Share club materials <Arrow /></Link>}
          </div>}
        </section>

        <aside className={styles.contribute}>
          <div><p className={styles.eyebrow}>{'// BETTER WHEN WE SHARE'}</p><h2>Found something worth passing on?</h2><p>Send it to the club on Discord. Officers can publish links, videos, and materials from their dashboard.</p></div>
          <div className={styles.contributeLinks}><a href="https://discord.gg/3qEnhQYtp3" target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>Suggest a resource <Arrow diagonal /></a><Link href="/officer">Officer publishing <Arrow /></Link></div>
        </aside>
      </div>
    </main>
  )
}

function ResourceCard({ resource }) {
  const format = RESOURCE_TYPES.find(item => item.value === resource.resourceType)?.label || 'Website'
  const level = RESOURCE_LEVELS.find(item => item.value === resource.difficulty)?.label
  return <article className={`${styles.card} ${resource.resourceType === 'video' ? styles.videoCard : ''}`}>
    <div className={styles.cardMeta}><span className={styles.format}>{format}</span><span>{level}</span></div>
    <p className={styles.provider}>{resource.provider}</p>
    <h3><a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}<Arrow diagonal /></a></h3>
    <p className={styles.description}>{resource.description}</p>
    <div className={styles.cardBottom}><div className={styles.tags}>{resource.tags.map(tag => <span key={tag}>{tag}</span>)}</div><span className={styles.destination}>{new URL(resource.url).hostname.replace(/^www\./, '')}</span></div>
  </article>
}

function HackathonCard({ event, now, checked }) {
  const status = hackathonStatus(event, now, checked)
  const deadline = upcomingDeadline(event, now)
  const acceptsApplications = status.key === 'open' || status.key === 'check'
  const link = acceptsApplications ? event.app : (event.source || event.link)
  return <article className={styles.eventCard}>
    <div className={styles.eventMain}>
      <div className={styles.eventIdentity}><span className={`${styles.statusBadge} ${styles[status.key]}`}>{status.label}</span><h3>{event.name}</h3><p>{event.school}</p><span className={styles.eventLocation}>{event.city || 'Location not verified'}</span></div>
      <div className={styles.eventFact}><span>Event dates</span><strong>{event.start ? `${formatDate(event.start)}${event.end && event.end !== event.start ? ` – ${formatDate(event.end)}` : ''}` : 'Not announced'}</strong><small>{event.start?.slice(0, 4) || 'Upcoming edition'}</small></div>
      <div className={styles.eventFact}><span>{deadline.label}</span><strong>{deadline.date ? formatDate(deadline.date, { year: 'numeric' }) : 'Not published'}</strong><small>{deadline.date ? (event.time && event.time !== 'Not published' ? event.time : 'Closing time not published') : 'Check the organizer’s site'}</small>{deadline.date === event.priority && event.deadline && <small>Final: {formatDate(event.deadline)}</small>}</div>
      <a href={link || event.link || event.source} target="_blank" rel="noopener noreferrer" className={status.key === 'open' ? styles.applyButton : styles.outlineButton}>{status.key === 'open' ? 'Apply' : status.key === 'check' ? 'Check form' : 'Visit site'} <Arrow diagonal /></a>
    </div>
    <details className={styles.eventDetails}>
      <summary>Team, travel & application notes <span aria-hidden="true">+</span></summary>
      <div className={styles.detailGrid}>
        <div><h4>Team size</h4><p>{typeof event.team === 'number' ? `Up to ${event.team} people. A team of four fits.` : 'Not verified. Check before applying as a team.'}</p><h4>Applications open</h4><p>{event.open ? formatDate(event.open, { year: 'numeric' }) : event.opens || 'Opening date not published'}</p></div>
        <div><h4>Travel support</h4><p>{event.travel || 'Not verified'}</p><h4>Food & overnight stay</h4><p>{event.stay || 'Not verified'}</p></div>
        <div><h4>Before you apply</h4><p>{event.notes || event.reason}</p><div className={styles.sourceLinks}><a href={event.source || event.link} target="_blank" rel="noopener noreferrer">Organizer / source <Arrow diagonal /></a>{event.source2 && <a href={event.source2} target="_blank" rel="noopener noreferrer">Additional details <Arrow diagonal /></a>}</div></div>
      </div>
    </details>
  </article>
}
