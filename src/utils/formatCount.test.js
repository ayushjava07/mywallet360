import assert from 'node:assert/strict'
import test from 'node:test'
import { formatCount } from './formatCount.js'

test('formats complete and capped counts without claiming an exact capped total', () => {
  assert.equal(formatCount(4321, true), '4,321')
  assert.equal(formatCount(5000, false), '5,000+')
})
