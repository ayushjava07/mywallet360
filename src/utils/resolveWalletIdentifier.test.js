import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getWalletIdentifierType,
  resolveWalletIdentifier,
} from './resolveWalletIdentifier.js'

const ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'

test('classifies supported wallet identifiers', () => {
  assert.equal(getWalletIdentifierType(ADDRESS), 'address')
  assert.equal(getWalletIdentifierType('vitalik.eth'), 'ens')
  assert.equal(getWalletIdentifierType('brad.crypto'), null)
  assert.equal(getWalletIdentifierType('not a wallet'), null)
})

test('returns Ethereum addresses without making a resolution request', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = () => {
    throw new Error('fetch should not be called')
  }

  try {
    assert.deepEqual(await resolveWalletIdentifier(` ${ADDRESS} `), {
      address: ADDRESS,
      type: 'address',
      originalInput: ADDRESS,
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('resolves a domain and preserves the original input', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ address: ADDRESS }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  try {
    assert.deepEqual(await resolveWalletIdentifier('vitalik.eth'), {
      address: ADDRESS,
      type: 'ens',
      originalInput: 'vitalik.eth',
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('shows the server user-friendly ENS resolution error', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({
    message: 'That ENS name was not found or has no Ethereum address.',
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })

  try {
    await assert.rejects(
      resolveWalletIdentifier('missing.eth'),
      /ENS name was not found/,
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})
