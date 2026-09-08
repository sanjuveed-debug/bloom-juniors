import test from 'node:test'
import assert from 'node:assert/strict'
import {
  mergeFoundationProfile,
  normalizeFoundationProfile,
} from '../src/utils/foundationProfile.js'

test('normalizes and limits parent foundation choices', () => {
  const profile = normalizeFoundationProfile({
    roots: [' Kerala ', 'kerala', 'Dubai'],
    languages: ['English', 'Malayalam'],
    traditions: ['Hindu'],
    priorities: ['thinking-communication', 'invalid', 'world-systems'],
    interests: ['family-roots-belonging', 'invalid'],
    beliefMode: 'family-and-world',
    previewMode: 'preview-roots',
    notes: '  Loves asking how machines work. ',
    updatedAt: 100,
  })

  assert.deepEqual(profile.roots, ['Kerala', 'Dubai'])
  assert.deepEqual(profile.priorities, ['thinking-communication', 'world-systems'])
  assert.deepEqual(profile.interests, ['family-roots-belonging'])
  assert.equal(profile.notes, 'Loves asking how machines work.')
})

test('cloud merge keeps the most recently edited foundation profile', () => {
  const local = normalizeFoundationProfile({ roots: ['Kerala'], updatedAt: 200 })
  const cloud = normalizeFoundationProfile({ roots: ['London'], updatedAt: 100 })
  assert.deepEqual(mergeFoundationProfile(local, cloud).roots, ['Kerala'])
  assert.deepEqual(mergeFoundationProfile(cloud, local).roots, ['Kerala'])
})
