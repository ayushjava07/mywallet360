const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const DEFAULT_AVATAR = 'cebc058af93e566c96200932c258f395cbf87ebd.png'
const EXAMPLE_WALLETS = [
  { label: 'Wallet 1', address: '0xbf03a2440bf80f7726ba5f60f0ac260ccad82a0b' },
  { label: 'Wallet 2', address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045' },
  { label: 'Wallet 3', address: '0x28c6c06298d514db089934071355e5743bf21d60' },
]

const compactAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`

const formatUsd = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  notation: Number(value) >= 1_000_000 ? 'compact' : 'standard',
}).format(Number(value || 0))

const formatNumber = (value, maximumFractionDigits = 4) => new Intl.NumberFormat('en-US', {
  maximumFractionDigits,
}).format(Number(value || 0))

const formatRelativeTime = (timestamp) => {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000))

  if (elapsedSeconds < 60) return 'Just now'
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)} minutes ago`
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)} hours ago`

  return `${Math.floor(elapsedSeconds / 86400)} days ago`
}

const personalityConfig = {
  nftCollector: { label: 'NFT Collector', icon: '99_918.svg', tone: 'primary' },
  trader: { label: 'Trader', icon: '99_917.svg', tone: 'blue' },
  defiExplorer: { label: 'DeFi Explorer', icon: '99_938.svg', tone: 'green' },
}

const transactionConfig = (type = '') => {
  const normalizedType = type.toLowerCase()

  if (normalizedType.includes('receive')) {
    return { tone: 'green', icon: '99_875.svg', positive: true }
  }

  if (normalizedType.includes('swap') || normalizedType.includes('trade')) {
    return { tone: 'blue', icon: '99_917.svg', positive: false }
  }

  if (normalizedType.includes('nft')) {
    return { tone: 'mint', icon: '99_896.svg', positive: false }
  }

  return { tone: 'mint', icon: '99_938.svg', positive: false }
}

function buildTransactions(timeline) {
  return timeline.map((item) => {
    const config = transactionConfig(item.type)
    const title = item.type.replace(/\b\w/g, (character) => character.toUpperCase())
    const amount = item.value ? `${config.positive ? '+' : '-'}${formatNumber(item.value.amount)}` : 'Contract'
    const crypto = item.value?.symbol || compactAddress(item.hash)

    return {
      displayTitle: title,
      title: item.hash,
      meta: formatRelativeTime(item.timestamp),
      amount,
      crypto,
      protocol: compactAddress(item.hash),
      protocolMark: title[0] || 'T',
      chain: 'Ethereum',
      ...config,
    }
  })
}

function buildWallet(address, analytics) {
  const personalityTraits = Object.entries(analytics.personality)
    .map(([key, value]) => ({ ...personalityConfig[key], value }))
    .sort((first, second) => second.value - first.value)
  const primaryPersonality = personalityTraits[0]
  const flowTotal = analytics.moneyFlow.received + analytics.moneyFlow.spent
  const receivedPercent = flowTotal ? Math.round((analytics.moneyFlow.received / flowTotal) * 100) : 0
  const spentPercent = flowTotal ? 100 - receivedPercent : 0
  const activityLevel = analytics.transactionCount > 500 ? 'Very High' : analytics.transactionCount > 100 ? 'High' : 'Moderate'
  const portfolioScore = Math.min(99, Math.round(50 + Math.log10(analytics.netWorth + 1) * 12))
  const largestHolding = analytics.largestHolding

  return {
    id: address.toLowerCase(),
    chipLabel: compactAddress(address),
    profile: {
      name: 'Wallet Analytics',
      wallet: compactAddress(address),
      avatar: DEFAULT_AVATAR,
    },
    balance: {
      value: formatUsd(analytics.netWorth),
      growth: 'Last 30 days',
      rank: `${analytics.transactionCount.toLocaleString()} txns`,
      stats: [
        { label: 'Transactions', value: analytics.transactionCount.toLocaleString(), icon: 'rank' },
        { label: 'Activity', value: activityLevel, icon: 'activity' },
        { label: 'NFTs', value: analytics.nftCount.toLocaleString(), icon: 'risk' },
        { label: 'Network', value: 'Ethereum', icon: 'network' },
      ],
    },
    portfolio: {
      status: analytics.netWorth > 0 ? 'Active' : 'Empty',
      score: portfolioScore,
      metrics: [
        {
          label: 'Largest Holding',
          value: largestHolding?.symbol || 'None',
          detail: largestHolding ? formatUsd(largestHolding.usdValue) : 'No priced holdings',
          icon: 'wallet',
          primary: true,
        },
        { label: 'NFT Count', value: analytics.nftCount.toLocaleString(), detail: 'Items collected', icon: 'nft' },
        { label: 'Received', value: `${formatNumber(analytics.moneyFlow.received)} ETH`, detail: `${analytics.moneyFlow.incomingCount} transfers`, icon: 'defi' },
        { label: 'Spent', value: `${formatNumber(analytics.moneyFlow.spent)} ETH`, detail: `${analytics.moneyFlow.outgoingCount} transfers`, icon: 'collection' },
      ],
    },
    identity: [
      { label: 'Portfolio Score', value: `${portfolioScore}/100`, description: 'Based on wallet value and activity', icon: 'portfolio', tone: 'gold' },
      { label: 'Transactions', value: analytics.transactionCount.toLocaleString(), description: 'Activity in the last 30 days', icon: 'risk', tone: 'blue' },
      { label: 'NFT Holdings', value: analytics.nftCount.toLocaleString(), description: 'Current NFT collection size', icon: 'age', tone: 'purple' },
      { label: 'Data Source', value: 'Etherscan', description: 'Last 30 days of on-chain analytics', icon: 'kyc', tone: 'green' },
    ],
    personality: {
      title: primaryPersonality?.label || 'New Wallet',
      description: `This wallet is primarily shaped by ${primaryPersonality?.label.toLowerCase() || 'limited on-chain activity'}.`,
      traits: personalityTraits,
    },
    ai: {
      summary: `${compactAddress(address)} has ${analytics.transactionCount.toLocaleString()} transactions and a net worth of ${formatUsd(analytics.netWorth)}.`,
      confidence: 'Based on the last 30 days of activity',
      insights: [
        { text: `${activityLevel} wallet activity.`, detail: `${analytics.transactionCount.toLocaleString()} transactions`, icon: 'network', tone: 'blue' },
        { text: `${analytics.nftCount.toLocaleString()} NFTs currently held.`, detail: 'Collection activity', icon: 'risk', tone: 'green' },
        { text: `${primaryPersonality?.label || 'No dominant behavior'} is the primary trait.`, detail: `${primaryPersonality?.value || 0}% score`, icon: 'growth', tone: 'teal' },
      ],
    },
    flow: {
      received: { value: `+${formatNumber(analytics.moneyFlow.received)} ETH`, percent: receivedPercent },
      spent: { value: `-${formatNumber(analytics.moneyFlow.spent)} ETH`, percent: spentPercent },
      categories: [
        { label: 'Incoming', value: `${analytics.moneyFlow.incomingCount} txns`, percent: receivedPercent, tone: 'mint', icon: '99_740.svg' },
        { label: 'Outgoing', value: `${analytics.moneyFlow.outgoingCount} txns`, percent: spentPercent, tone: 'red', icon: '99_756.svg' },
      ],
    },
    transactions: buildTransactions(analytics.timeline),
    highlights: [
      { label: 'Largest Holding', value: largestHolding?.symbol || 'None', detail: `${largestHolding?.percentage || 0}%`, icon: 'holding', tone: 'violet' },
      { label: 'Money Received', value: `${formatNumber(analytics.moneyFlow.received)} ETH`, detail: `${analytics.moneyFlow.incomingCount} transfers`, icon: 'protocol', tone: 'pink' },
      { label: 'Money Spent', value: `${formatNumber(analytics.moneyFlow.spent)} ETH`, detail: `${analytics.moneyFlow.outgoingCount} transfers`, icon: 'chain', tone: 'blue' },
      { label: 'Transactions', value: analytics.transactionCount.toLocaleString(), detail: 'last 30 days', icon: 'transactions', tone: 'green' },
    ],
    insights: [
      { label: 'Net Worth', value: formatNumber(analytics.netWorth, 2), suffix: 'USD' },
      { label: 'Largest Holding', value: largestHolding?.percentage || 0, suffix: '%' },
    ],
  }
}

async function getWalletByAddress(address) {
  const normalizedAddress = address.trim()

  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    throw new Error('Enter a valid Ethereum wallet address.')
  }

  const response = await fetch(`${API_BASE_URL}/api/wallet/${normalizedAddress}`)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to fetch wallet analytics.')
  }

  return buildWallet(normalizedAddress, data)
}

export const walletService = {
  getWalletByAddress,
  listExampleWallets: () => EXAMPLE_WALLETS,
}
