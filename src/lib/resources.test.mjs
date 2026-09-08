import test from 'node:test'
import assert from 'node:assert/strict'
import { safeResourceUrl, getResourceHref, validateResourceInput, RESOURCE_TYPES } from './resources.mjs'

test('resource links reject executable, relative, malformed, and credential-bearing URLs', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '/private.pdf', '//example.org', 'https://u:p@example.org', '', null, {}]) {
    assert.equal(safeResourceUrl(url), null)
  }
  assert.equal(safeResourceUrl(' https://example.org/video '), 'https://example.org/video')
})

test('video and document links work, while existing uploaded files retain a fallback', () => {
  assert.equal(getResourceHref({resourceType: 'video', url: 'https://youtu.be/example'}), 'https://youtu.be/example')
  assert.equal(getResourceHref({resourceType: 'document', url: 'https://example.org/slides.pdf'}), 'https://example.org/slides.pdf')
  assert.equal(getResourceHref({url: 'javascript:void(0)', fileUrl: 'https://cdn.sanity.io/file.pdf'}), 'https://cdn.sanity.io/file.pdf')
})

test('every officer format preserves its URL and normalizes searchable metadata', () => {
  for (const { value: resourceType } of RESOURCE_TYPES) {
    const result = validateResourceInput({title: ' Workshop ', url: 'https://example.org/watch', resourceType, librarySection: 'materials', difficulty: 'beginner', tags: [' Python ', '', 'Python']})
    assert.equal(result.error, undefined)
    assert.equal(result.value.url, 'https://example.org/watch')
    assert.equal(result.value.title, 'Workshop')
    assert.deepEqual(result.value.tags, ['Python'])
  }
})

test('publishing rejects missing content and unknown metadata; ignores client ownership and access', () => {
  const valid = {title: 'Example', url: 'https://example.org'}
  for (const change of [{title: '  '}, {url: ''}, {resourceType: 'invalid'}, {librarySection: 'invalid'}, {difficulty: 'invalid'}, {tags: ['x'.repeat(41)]}, {tags: 'python'}, {categoryId: {}}, {description: {text: 'bad'}}]) {
    assert.ok(validateResourceInput({...valid, ...change}).error)
  }
  const {value} = validateResourceInput({...valid, club: {_ref: 'someone-else'}, accessLevel: 'members', featured: true})
  assert.equal(value.club, undefined)
  assert.equal(value.accessLevel, undefined)
  assert.equal(value.featured, undefined)
})
