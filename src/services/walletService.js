import { apiFetch } from '../utils/api.js'
import { formatCount } from '../utils/formatCount.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
export const ANALYSIS_PERIODS = [
  { value: 'ytd', id: 'ytd', label: 'Year to date', shortLabel: 'YTD', description: 'Activity since January 1' },
  { value: 1, id: '1d', label: 'Last day', shortLabel: '1D', description: 'Today’s activity' },
  { value: 7, id: '7d', label: 'Last week', shortLabel: '7D', description: 'Recent activity' },
  { value: 30, id: '30d', label: 'Last 30 days', shortLabel: '30D', description: 'Monthly overview' },
  { value: 365, id: '365d', label: 'Last year', shortLabel: '1Y', description: 'Long-term activity' },
]
const DEFAULT_AVATAR = 'cebc058af93e566c96200932c258f395cbf87ebd.png'
const VITALIK_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
const compactAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`
const EXAMPLE_WALLETS = [
  {
    name: 'vitalik.eth',
    label: 'vitalik.eth',
    type: 'ENS name',
    description: 'Resolve the ENS name first, then analyze its public Ethereum activity.',
    identifier: 'vitalik.eth',
    address: VITALIK_ADDRESS,
  },
  {
    name: 'vitalik.eth resolved address',
    label: compactAddress(VITALIK_ADDRESS),
    type: 'Resolved Ethereum address',
    description: 'Analyze the same wallet directly using the address resolved from vitalik.eth.',
    identifier: VITALIK_ADDRESS,
    address: VITALIK_ADDRESS,
  },
]

const formatUsd = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  notation: Number(value) >= 1_000_000 ? 'compact' : 'standard',
}).format(Number(value || 0))

const formatNumber = (value, maximumFractionDigits = 4) => new Intl.NumberFormat('en-US', {
  maximumFractionDigits,
}).format(Number(value || 0))

const explanation = (title, summary, formula, details = []) => ({ title, summary, formula, details })

function buildFallbackValuationHistory(netWorth, period) {
  const start = period?.start?.slice(0, 10)
  const end = period?.end?.slice(0, 10)
  if (!start || !end) return []

  const value = Number(netWorth || 0)
  return start === end
    ? [{ date: end, value }]
    : [{ date: start, value }, { date: end, value }]
}

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
  holder: { label: 'Holder', icon: '99_959.svg', tone: 'green' },
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
  const periodLabel = ANALYSIS_PERIODS.find((period) => period.id === analytics.period.id)?.label
    || `Last ${analytics.period.days} days`
  const factors = analytics.personalityFactors || {}
  const personalityExplanations = {
    nftCollector: explanation(
      'Why NFT Collector?',
      'NFT activity receives two points for every NFT transfer found in the selected period.',
      'NFT Collector score = NFT transfers × 2',
      [`${formatNumber(factors.nftTransfers, 0)} NFT transfers contributed to this score.`],
    ),
    trader: explanation(
      'Why Trader?',
      'Trading behavior combines recognized swap calls with outgoing token transfers.',
      'Trader score = swaps × 3 + outgoing token transfers',
      [`${formatNumber(factors.swapCount, 0)} swaps and ${formatNumber(factors.outgoingTransfers, 0)} outgoing token transfers were found.`],
    ),
    defiExplorer: explanation(
      'Why DeFi Explorer?',
      'Interactions with recognized Aave, Compound, and 1inch contracts increase this score.',
      'DeFi Explorer score = recognized DeFi interactions × 3',
      [`${formatNumber(factors.defiInteractions, 0)} recognized DeFi interactions were found.`],
    ),
    holder: explanation(
      'Why Holder?',
      'Holding behavior grows when incoming transfers exceed outgoing transfers and when the wallet currently owns more assets.',
      'Holder score = max(0, incoming − outgoing) + current assets',
      [`${formatNumber(factors.incomingTransfers, 0)} incoming transfers, ${formatNumber(factors.outgoingTransfers, 0)} outgoing transfers, and ${formatNumber(factors.currentAssetCount, 0)} current assets were used.`],
    ),
  }
  const personalityTraits = Object.entries(analytics.personality)
    .map(([key, value]) => ({ ...personalityConfig[key], value }))
    .sort((first, second) => second.value - first.value)
  const primaryPersonality = personalityTraits[0]
  const flowTotal = analytics.moneyFlow.received + analytics.moneyFlow.spent
  const receivedPercent = flowTotal ? Math.round((analytics.moneyFlow.received / flowTotal) * 100) : 0
  const spentPercent = flowTotal ? 100 - receivedPercent : 0
  const activityLevel = analytics.transactionCount > 500 ? 'Very High' : analytics.transactionCount > 100 ? 'High' : 'Moderate'
  const transactionCount = formatCount(analytics.transactionCount, analytics.analysisWindow?.normalTransactionsComplete)
  const portfolioScore = Math.min(99, Math.round(50 + Math.log10(analytics.netWorth + 1) * 12))
  const largestHolding = analytics.largestHolding
  const valuationHistory = analytics.valuationHistory?.length
    ? analytics.valuationHistory
    : buildFallbackValuationHistory(analytics.netWorth, analytics.period)

  return {
    id: address.toLowerCase(),
    analysisDays: analytics.period.id === 'ytd' ? 'ytd' : analytics.period.days,
    periodLabel,
    reportRange: {
      from: analytics.period.start.slice(0, 10),
      to: analytics.period.end.slice(0, 10),
    },
    chipLabel: compactAddress(address),
    profile: {
      name: 'Wallet Analytics',
      wallet: compactAddress(address),
      avatar: DEFAULT_AVATAR,
    },
    balance: {
      value: formatUsd(analytics.netWorth),
      history: valuationHistory.map((point) => ({
        ...point,
        formattedValue: formatUsd(point.value),
      })),
      valuationLabel: `BlockAction estimated priced assets${analytics.valuation.complete === false ? ' (partial)' : ''}`,
      growth: periodLabel,
      rank: `${transactionCount} txns`,
      explanation: explanation(
        'How period-estimated assets are calculated',
        'This sums ETH and supported token balances estimated from BlockAction data for the selected period.',
        'Estimated priced assets = Σ(estimated token balance × supported USD price)',
        [
          `${analytics.valuation?.pricedAssetCount || 0} of ${analytics.valuation?.totalAssetCount || 0} discovered assets had prices.`,
          'Source: BlockAction (BlobLens) balances, prices, and transfer history.',
          analytics.valuation?.complete === false ? 'Token-transfer history hit the page cap, so this estimate is partial.' : 'Token-transfer pagination completed for the selected period.',
        ],
      ),
      stats: [
        { label: 'Transactions', value: transactionCount, icon: 'rank' },
        { label: 'Activity', value: activityLevel, icon: 'activity', explanation: explanation('Activity level', 'A simple label based on transaction count in the selected period.', 'Very High: >500 · High: >100 · Moderate: ≤100', [`This wallet has ${transactionCount} transactions in the selected period.`]) },
        { label: 'NFT Activity', value: analytics.personalityFactors?.nftTransfers?.toLocaleString() || '0', icon: 'risk' },
        {
          label: 'Network',
          value: analytics.valuation?.networks?.length
            ? analytics.valuation.networks.map((network) => network === 'eth-mainnet' ? 'Ethereum' : network).join(', ')
            : 'None',
          icon: 'network',
        },
      ],
    },
    portfolio: {
      status: analytics.netWorth > 0 ? 'Active' : 'Empty',
      score: portfolioScore,
      scoreExplanation: explanation('Portfolio Score', 'A presentation score based on the logarithm of the selected period asset estimate.', 'min(99, round(50 + log10(estimated priced assets + 1) × 12))', [`Current score: ${portfolioScore}/100.`]),
      metrics: [
        {
          label: 'Largest Holding',
          value: largestHolding?.symbol || 'None',
          detail: largestHolding ? formatUsd(largestHolding.usdValue) : 'No priced holdings',
          icon: 'wallet',
          primary: true,
          explanation: explanation('Largest priced holding', 'The priced asset with the highest calculated USD value in this estimate.', 'Largest holding = max(balance × USD price)', [`It represents ${largestHolding?.percentage || 0}% of the selected period estimate.`]),
        },
        {
          label: 'Risk Level',
          value: analytics.riskScore.level,
          detail: `${analytics.riskScore.score}/100 heuristic score`,
          icon: 'nft',
          explanation: explanation(
            'Risk Level Heuristic',
            'Evaluates wallet risk based on asset concentration, transaction failure rates, and protocol diversity.',
            'Risk score = 100 − concentration × 0.45 − failure rate × 0.35 + diversity',
            [
              `Concentration: ${analytics.riskScore.factors?.holdingConcentration || 0}% weight on the largest asset.`,
              `Failed transactions: ${analytics.riskScore.factors?.failedTransactionRate || 0}% error rate.`,
              `Protocol diversity: ${analytics.riskScore.factors?.protocolDiversity || 0} recognized protocols used.`,
            ],
          ),
        },
        {
          label: 'Most Used Protocol',
          value: analytics.mostUsedProtocol.name,
          detail: `${analytics.mostUsedProtocol.interactionCount.toLocaleString()} recognized interactions`,
          icon: 'defi',
          explanation: explanation(
            'Most Used Protocol',
            'Identifies the platform or contract this wallet interacted with the most during the selected period.',
            'Most used protocol = max(interactions per protocol)',
            [
              'Tracks Uniswap, OpenSea, Aave, Compound, and 1inch.',
              'Other includes all other contract interactions.',
              `${analytics.mostUsedProtocol.interactionCount.toLocaleString()} interactions with ${analytics.mostUsedProtocol.name}.`,
            ],
          ),
        },
        {
          label: 'Discovered Assets',
          value: Number(analytics.assetCount ?? analytics.valuation?.totalAssetCount ?? 0).toLocaleString(),
          detail: analytics.valuation.complete ? 'Transfer scan completed' : 'Partial transfer scan',
          icon: 'collection',
          explanation: explanation(
            'Discovered Assets',
            'The total number of unique ERC-20 and ERC-721 tokens identified in the wallet\'s history.',
            'Discovered assets = unique token contracts with transfer history',
            [
              'Scans incoming and outgoing token transfers for the selected period.',
              analytics.valuation.complete ? 'Full transfer scan was completed.' : 'Partial scan (hit the page cap).',
            ],
          ),
        },
      ],
    },
    identity: [
      { label: 'Portfolio Score', value: `${portfolioScore}/100`, description: 'Based on the selected period asset estimate', icon: 'portfolio', tone: 'gold' },
      { label: 'Transactions', value: transactionCount, description: `Activity during ${periodLabel.toLowerCase()}`, icon: 'risk', tone: 'blue' },
      { label: 'NFT Activity', value: analytics.personalityFactors?.nftTransfers?.toLocaleString() || '0', description: `Transfers during ${periodLabel.toLowerCase()}`, icon: 'age', tone: 'purple' },
      { label: 'Data Source', value: 'BlockAction', description: analytics.valuation.complete ? 'Transfer scan completed' : 'Partial transfer scan', icon: 'kyc', tone: 'green' },
    ],
    personality: {
      title: primaryPersonality?.label || 'New Wallet',
      description: `This wallet is primarily shaped by ${primaryPersonality?.label.toLowerCase() || 'limited on-chain activity'}.`,
      traits: personalityTraits,
      explanation: personalityExplanations[Object.entries(analytics.personality).sort((first, second) => second[1] - first[1])[0]?.[0]],
    },
    flow: {
      periodLabel,
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
      { label: 'Transactions', value: transactionCount, detail: periodLabel.toLowerCase(), icon: 'transactions', tone: 'green' },
    ],
    insights: [
      { label: 'Risk Level', value: analytics.riskScore.level, suffix: `${analytics.riskScore.score}/100` },
      { label: 'Recognized Protocol', value: analytics.mostUsedProtocol.name, suffix: `${analytics.mostUsedProtocol.interactionCount} interactions` },
    ],
  }
}

async function getWalletByAddress(address, analysisPeriod = 'ytd') {
  const normalizedAddress = address.trim()

  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    throw new Error('Enter a valid Ethereum wallet address.')
  }

  const query = analysisPeriod === 'ytd' ? 'period=ytd' : `days=${analysisPeriod}`
  const response = await apiFetch(`${API_BASE_URL}/api/wallet/${normalizedAddress}?${query}`)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to fetch wallet analytics.')
  }

  const expectedPeriodId = analysisPeriod === 'ytd' ? 'ytd' : `${analysisPeriod}d`
  if (data?.period?.id !== expectedPeriodId) {
    throw new Error('The API returned stale period data. Restart or deploy the latest backend.')
  }

  return buildWallet(normalizedAddress, data)
}

async function downloadTransactionReport(address, from, to) {
  const query = new URLSearchParams({ from, to })
  const response = await apiFetch(`${API_BASE_URL}/api/report/${address}?${query}`, {
    headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'Unable to create the transaction report.')
  }

  const blob = await response.blob()
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const disposition = response.headers.get('content-disposition') || ''
  const filename = disposition.match(/filename="([^"]+)"/)?.[1]
    || `mywallet360-${address.slice(0, 8)}-${from}-to-${to}.xlsx`

  link.href = downloadUrl
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(downloadUrl)
}

export const walletService = {
  downloadTransactionReport,
  getWalletByAddress,
  listExampleWallets: () => EXAMPLE_WALLETS,
}
