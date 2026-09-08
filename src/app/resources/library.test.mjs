import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { collectResources, filterResources, hackathonStatus, filterHackathons, upcomingDeadline } from './library.mjs'
import { curatedResources } from './curated.mjs'
const snapshot = JSON.parse(readFileSync(new URL('./hackathons.json', import.meta.url)))
const events = [...snapshot.events, ...snapshot.watch]
const now = '2026-09-08T22:00:00Z'

test('only public, explicitly selected resources enter the shared library', () => {
  const base = {_id: 'one', title: 'Slides', url: 'https://example.org/slides', librarySection: 'materials'}
  const result = collectResources([], [base, {...base, _id: 'private', accessLevel: 'members', url: 'https://example.org/private'}, {...base, _id: 'legacy', librarySection: undefined}, {...base, _id: 'invalid', url: 'javascript:alert(1)'}])
  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'one')
  assert.equal(JSON.stringify(result).includes('/private'), false)
})

test('CMS entries can replace a starter URL without duplicate cards', () => {
  const result = collectResources(curatedResources, [{...curatedResources[0], _id: 'club-curation', description: 'Club notes'}])
  assert.equal(result.length, curatedResources.length)
  assert.equal(result.find(r => r.id === 'club-curation').description, 'Club notes')
  assert.equal(result.find(r => r.id === 'club-curation').starterId, 'starter-cs50')
})

test('filters combine topic, level, format and case-insensitive multiword searches', () => {
  const resources = collectResources(curatedResources, [])
  assert.equal(filterResources(resources, {search: ' HUGGING python ', type: 'course', level: 'intermediate', topic: 'AI & machine learning'}).length, 1)
  assert.equal(filterResources(resources, {search: 'missing-resource'}).length, 0)
  assert.equal(filterResources(resources, {section: 'materials'}).length, 0)
  assert.equal(filterResources(resources).length, 8)
})

test('September 8 snapshot distinguishes nine open applications, five portals and eleven watch/closed events', () => {
  assert.equal(events.length, 25)
  assert.equal(filterHackathons(events, {now, checked: snapshot.checked, status: 'open'}).length, 9)
  assert.equal(filterHackathons(events, {now, checked: snapshot.checked, status: 'check'}).length, 5)
  const four = filterHackathons(events, {now, checked: snapshot.checked, teamOfFour: true})
  assert.ok(four.some(e => e.name === 'HackPSU Fall'))
  assert.ok(!four.some(e => e.name === 'HackHarvard'))
})

test('exact Eastern and Pacific deadlines close in their own timezones', () => {
  const cornell = events.find(e => e.name === 'BigRed//Hacks')
  assert.equal(hackathonStatus(cornell, '2026-09-10T03:59:30Z', snapshot.checked).key, 'open')
  assert.equal(hackathonStatus(cornell, '2026-09-10T04:00:00Z', snapshot.checked).key, 'closed')
  const washington = events.find(e => e.name === 'DubHacks')
  assert.equal(upcomingDeadline(washington, '2026-10-03T06:30:00Z').label, 'Priority deadline')
  assert.equal(upcomingDeadline(washington, '2026-10-03T07:00:00Z').label, 'Application deadline')
  assert.notEqual(hackathonStatus(washington, '2026-10-10T06:30:00Z', snapshot.checked).key, 'closed')
  assert.equal(hackathonStatus(washington, '2026-10-10T07:00:00Z', snapshot.checked).key, 'closed')
})

test('unknown deadline times are not fabricated; past events and stale openings stop appearing open', () => {
  const texas = events.find(e => e.name === 'HackTX')
  assert.equal(hackathonStatus(texas, '2026-09-12T03:00:00Z', snapshot.checked).key, 'open')
  assert.equal(hackathonStatus(texas, '2026-09-12T05:00:00Z', snapshot.checked).key, 'closed')
  assert.equal(hackathonStatus(texas, '2026-10-26T12:00:00Z', snapshot.checked).key, 'ended')
  assert.equal(hackathonStatus(events.find(e => e.name === 'HackRPI'), '2026-10-01T12:00:00Z', snapshot.checked).key, 'check')
  assert.equal(hackathonStatus(events.find(e => e.name === 'DivHacks'), now, snapshot.checked).key, 'closed')
})

test('a passed priority round does not close regular applications', () => {
  const michigan = events.find(e => e.name === 'MHacks')
  assert.equal(upcomingDeadline(michigan, now).date, '2026-09-12')
  assert.equal(hackathonStatus(michigan, now, snapshot.checked).key, 'open')
})
