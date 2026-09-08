import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { validateResourceInput } from '../../../../lib/resources.mjs'

// Exercise the actual handler with in-memory auth and storage. Never write to the live CMS.
async function handlerFor(session) {
  const writes = []
  const context = vm.createContext({Response, console})
  const values = {
    '@/sanity/lib/client': {client: {create: async record => {writes.push(record); return {...record, _id: 'local-test'} }}},
    '@/lib/secure-tokens': {verifySecureToken: async () => session === 'valid' ? {valid: true, data: {clubId: 'officers-club'}} : {valid: false}},
    'next/headers': {cookies: async () => ({get: () => session ? {value: session} : undefined})},
    '@/lib/resources.mjs': {validateResourceInput},
  }
  const route = new vm.SourceTextModule(readFileSync(new URL('./route.js', import.meta.url), 'utf8'), {context})
  await route.link(specifier => {
    const exports = values[specifier]
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
    }, {context})
  })
  await route.evaluate()
  return {post: route.namespace.POST, writes}
}
const request = body => new Request('http://localhost/api/officer/create-resource', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})

test('unauthenticated or expired sessions cannot create resources', async () => {
  for (const session of [null, 'expired']) {
    const {post, writes} = await handlerFor(session)
    assert.equal((await post(request({title: 'Video', url: 'https://example.org'}))).status, 401)
    assert.equal(writes.length, 0)
  }
})

test('valid officer saves a video URL, tags and library collection under their own club', async () => {
  const {post, writes} = await handlerFor('valid')
  const response = await post(request({title: 'Workshop recording', resourceType: 'video', url: 'https://youtu.be/example', librarySection: 'materials', tags: ['Python'], clubId: 'someone-else', accessLevel: 'members'}))
  assert.equal(response.status, 200)
  assert.equal(writes.length, 1)
  assert.equal(writes[0].club._ref, 'officers-club')
  assert.equal(writes[0].url, 'https://youtu.be/example')
  assert.equal(writes[0].librarySection, 'materials')
  assert.equal(writes[0].accessLevel, 'public')
  assert.ok(writes[0].publishedAt)
})

test('invalid links return an actionable 400 without a CMS write', async () => {
  const {post, writes} = await handlerFor('valid')
  const response = await post(request({title: 'Bad link', url: 'javascript:alert(1)'}))
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /https/)
  assert.equal(writes.length, 0)
})
