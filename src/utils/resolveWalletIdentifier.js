const API_BASE_URL = import.meta.env?.VITE_API_URL || ''
const ETHEREUM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

export const getWalletIdentifierType = (input) => {
  const normalizedInput = input.trim().toLowerCase()

  if (ETHEREUM_ADDRESS_PATTERN.test(normalizedInput)) return 'address'

  const tld = normalizedInput.split('.').pop()

  if (tld === 'eth') return 'ens'

  return null
}

export const resolveWalletIdentifier = async (input) => {
  const originalInput = input.trim()
  const type = getWalletIdentifierType(originalInput)

  if (!originalInput || !type) {
    throw new Error('Enter a valid Ethereum address or ENS name.')
  }

  if (type === 'address') {
    return {
      address: originalInput,
      type,
      originalInput,
    }
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}/api/resolve/${encodeURIComponent(originalInput)}`)
  } catch {
    throw new Error('Domain resolution is unavailable right now. Please try again.')
  }

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || (
      response.status === 404
        ? 'ENS search is unavailable on the current backend. Restart or deploy the latest backend.'
        : 'We could not resolve that ENS name right now. Please try again.'
    ))
  }

  if (!ETHEREUM_ADDRESS_PATTERN.test(result.address)) {
    throw new Error('That domain does not have a valid Ethereum address.')
  }

  return {
    address: result.address,
    type,
    originalInput,
  }
}
