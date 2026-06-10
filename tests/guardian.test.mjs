import test from 'node:test'
import assert from 'node:assert/strict'

import {
  isGuardianRegistered,
  normalizeGuardianData,
} from '../src/utils/guardian.js'

test('normalizeGuardianData trims contact fields and restricts the parent PIN', () => {
  const guardian = normalizeGuardianData({
    guardianName: '  Sanju Veed  ',
    relationship: ' Parent ',
    email: '  SANJU@EXAMPLE.COM ',
    phone: ' +971 (555) 123-4567 ext. 9 ',
    pin: '98a76',
    consentAccepted: true,
    registeredAt: '2026-04-09T08:15:00.000Z',
  })

  assert.deepEqual(guardian, {
    guardianName: 'Sanju Veed',
    relationship: 'Parent',
    email: 'sanju@example.com',
    phone: '+971 (555) 123-4567 9',
    pin: '9876',
    consentAccepted: true,
    registeredAt: '2026-04-09T08:15:00.000Z',
    classroomMode: false,
    schoolId: null,
    classId: null,
    schoolName: '',
    teacherRole: '',
    className: '',
    classCode: '',
  })
})

test('isGuardianRegistered requires full guardian details and consent', () => {
  assert.equal(
    isGuardianRegistered({
      guardianName: 'Sanju Veed',
      relationship: 'Mother',
      email: 'sanju@example.com',
      phone: '',
      pin: '1234',
      consentAccepted: true,
    }),
    true,
  )

  assert.equal(
    isGuardianRegistered({
      guardianName: 'Sanju Veed',
      relationship: 'Mother',
      email: 'sanju@example.com',
      phone: '',
      pin: '1234',
      consentAccepted: false,
    }),
    false,
  )
})
