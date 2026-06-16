import assert from 'node:assert/strict'
import test from 'node:test'
import { formatCount } from './formatCount.js'

test('formats counts with locale separators', () => {
  assert.equal(formatCount(4321), '4,321')
  assert.equal(formatCount(5000), '5,000')
})
