const transaction = (displayTitle, meta, amount, crypto, protocol, chain, tone, icon, positive = false) => ({
  displayTitle,
  title: displayTitle,
  meta,
  amount,
  crypto,
  protocol,
  protocolMark: protocol[0],
  chain,
  tone,
  icon,
  positive,
})

export const mockWallets = {
  vitalik: {
    id: 'vitalik',
    chipLabel: 'vitalik.eth',
    profile: { name: 'Vitalik Buterin', wallet: 'vitalik.eth', avatar: 'cebc058af93e566c96200932c258f395cbf87ebd.png' },
    balance: {
      value: '$824.6M',
      growth: '+8.7% this month',
      rank: 'Top 0.01%',
      stats: [
        { label: 'Wallet Rank', value: 'Top 0.01%', icon: 'rank' },
        { label: 'Activity', value: 'High', icon: 'activity' },
        { label: 'Risk', value: 'Low', icon: 'risk' },
        { label: 'Networks', value: '12', icon: 'network' },
      ],
    },
    portfolio: {
      status: 'Excellent',
      score: 99,
      metrics: [
        { label: 'Portfolio Value', value: '243K ETH', detail: '≈ $824.6M', icon: 'wallet', primary: true },
        { label: 'NFT Count', value: '1,284', detail: 'Items collected', icon: 'nft' },
        { label: 'DeFi Stake', value: '$18.4M', detail: 'Currently staked', icon: 'defi' },
        { label: 'Collection', value: 'ENS', detail: 'Ethereum Name Service', icon: 'collection' },
      ],
    },
    identity: [
      { label: 'Portfolio Score', value: '99/100', description: 'Exceptional financial reputation', icon: 'portfolio', tone: 'gold' },
      { label: 'Risk Score', value: '97/100', description: 'Low-risk wallet behavior', icon: 'risk', tone: 'blue' },
      { label: 'Account Age', value: '10 years 3 months', description: 'Established wallet history', icon: 'age', tone: 'purple' },
      { label: 'KYC Status', value: 'Tier 3 Verified', description: 'Account status: Active', icon: 'kyc', tone: 'green' },
    ],
    personality: {
      title: 'Ethereum Builder',
      description: 'This wallet is shaped by long-term Ethereum ecosystem activity.',
      traits: [
        { label: 'Long-term Holder', value: 62, icon: '99_875.svg', tone: 'primary' },
        { label: 'Ecosystem Builder', value: 28, icon: '99_938.svg', tone: 'blue' },
        { label: 'Collector', value: 10, icon: '99_918.svg', tone: 'green' },
      ],
    },
    ai: {
      summary: 'This wallet behaves like a long-term Ethereum ecosystem builder.',
      confidence: 'Very high-confidence pattern',
      insights: [
        { text: 'Most activity occurs on Ethereum.', detail: 'Primary network', icon: 'network', tone: 'blue' },
        { text: 'Risk level is exceptionally low.', detail: 'Healthy behavior', icon: 'risk', tone: 'green' },
        { text: 'Long-term holdings remain dominant.', detail: '+8.7% monthly', icon: 'growth', tone: 'teal' },
      ],
    },
    flow: {
      received: { value: '+$12.8M', percent: 74 },
      spent: { value: '-$3.1M', percent: 18 },
      categories: [
        { label: 'Grants', value: '$1.4M', percent: 45, tone: 'mint', icon: '99_918.svg' },
        { label: 'DeFi', value: '$930K', percent: 30, tone: 'blue', icon: '99_938.svg' },
        { label: 'Transfers', value: '$465K', percent: 15, tone: 'green', icon: '99_917.svg' },
        { label: 'Gas & Fees', value: '$310K', percent: 10, tone: 'red', icon: '99_969.svg' },
      ],
    },
    transactions: [
      transaction('Sent ETH Grant', '2 hours ago', '-$420,000', '124 ETH', 'Gitcoin', 'Ethereum', 'mint', '99_875.svg'),
      transaction('Received ETH', 'Yesterday', '+$1,280,000', '378 ETH', 'Ethereum', 'Ethereum', 'green', '99_875.svg', true),
      transaction('Swap ETH → USDC', '4 days ago', '820,000 USDC', '242 ETH', 'Uniswap', 'Ethereum', 'blue', '99_917.svg'),
    ],
    highlights: [
      { label: 'Largest Holding', value: 'ETH', detail: '82%', icon: 'holding', tone: 'violet' },
      { label: 'Top Protocol', value: 'Uniswap', detail: '$18.4M', icon: 'protocol', tone: 'pink' },
      { label: 'Most Active Chain', value: 'Ethereum', detail: '94%', icon: 'chain', tone: 'blue' },
      { label: 'Monthly Transactions', value: '386', detail: 'transactions', icon: 'transactions', tone: 'green' },
    ],
    insights: [{ label: 'Monthly ROI', value: '+8.7', suffix: '%' }, { label: 'Gas saved', value: '18,240', suffix: 'USD' }],
  },
  jup: {
    id: 'jup',
    chipLabel: 'jup.sol',
    profile: { name: 'Jupiter Wallet', wallet: 'jup.sol', avatar: 'cebc058af93e566c96200932c258f395cbf87ebd.png' },
    balance: {
      value: '$48.2M',
      growth: '+21.6% this month',
      rank: 'Top 0.1%',
      stats: [
        { label: 'Wallet Rank', value: 'Top 0.1%', icon: 'rank' },
        { label: 'Activity', value: 'Very High', icon: 'activity' },
        { label: 'Risk', value: 'Low', icon: 'risk' },
        { label: 'Networks', value: '7', icon: 'network' },
      ],
    },
    portfolio: {
      status: 'Excellent',
      score: 96,
      metrics: [
        { label: 'Portfolio Value', value: '32.1M JUP', detail: '≈ $28.9M', icon: 'wallet', primary: true },
        { label: 'NFT Count', value: '318', detail: 'Items collected', icon: 'nft' },
        { label: 'DeFi Stake', value: '$16.7M', detail: 'Currently staked', icon: 'defi' },
        { label: 'Collection', value: 'Mad Lads', detail: 'Top Solana collection', icon: 'collection' },
      ],
    },
    identity: [
      { label: 'Portfolio Score', value: '96/100', description: 'Excellent financial reputation', icon: 'portfolio', tone: 'gold' },
      { label: 'Risk Score', value: '89/100', description: 'Healthy wallet behavior', icon: 'risk', tone: 'blue' },
      { label: 'Account Age', value: '4 years 2 months', description: 'Established Solana history', icon: 'age', tone: 'purple' },
      { label: 'KYC Status', value: 'Tier 3 Verified', description: 'Account status: Active', icon: 'kyc', tone: 'green' },
    ],
    personality: {
      title: 'DeFi Power User',
      description: 'This wallet is shaped by high-volume Solana DeFi activity.',
      traits: [
        { label: 'DeFi Explorer', value: 68, icon: '99_938.svg', tone: 'primary' },
        { label: 'Trader', value: 24, icon: '99_917.svg', tone: 'blue' },
        { label: 'NFT Collector', value: 8, icon: '99_918.svg', tone: 'green' },
      ],
    },
    ai: {
      summary: 'This wallet behaves like a high-volume Solana DeFi power user.',
      confidence: 'High-confidence pattern',
      insights: [
        { text: 'Most activity occurs on Solana.', detail: 'Primary network', icon: 'network', tone: 'blue' },
        { text: 'Trading velocity is above average.', detail: 'Active behavior', icon: 'risk', tone: 'green' },
        { text: 'Portfolio growth accelerated this month.', detail: '+21.6% monthly', icon: 'growth', tone: 'teal' },
      ],
    },
    flow: {
      received: { value: '+$9.8M', percent: 68 },
      spent: { value: '-$6.4M', percent: 44 },
      categories: [
        { label: 'Swaps', value: '$2.9M', percent: 45, tone: 'mint', icon: '99_917.svg' },
        { label: 'DeFi', value: '$1.9M', percent: 30, tone: 'blue', icon: '99_938.svg' },
        { label: 'Transfers', value: '$960K', percent: 15, tone: 'green', icon: '99_875.svg' },
        { label: 'Gas & Fees', value: '$640K', percent: 10, tone: 'red', icon: '99_969.svg' },
      ],
    },
    transactions: [
      transaction('Swap SOL → JUP', '35 minutes ago', '1,240,000 JUP', '8,900 SOL', 'Jupiter', 'Solana', 'blue', '99_917.svg'),
      transaction('Received USDC', '3 hours ago', '+$640,000', '640K USDC', 'Circle', 'Solana', 'green', '99_875.svg', true),
      transaction('Staked SOL', '2 days ago', '-$410,000', '2,850 SOL', 'Marinade', 'Solana', 'mint', '99_938.svg'),
    ],
    highlights: [
      { label: 'Largest Holding', value: 'JUP', detail: '60%', icon: 'holding', tone: 'violet' },
      { label: 'Top Protocol', value: 'Jupiter', detail: '$12.8M', icon: 'protocol', tone: 'pink' },
      { label: 'Most Active Chain', value: 'Solana', detail: '91%', icon: 'chain', tone: 'blue' },
      { label: 'Monthly Transactions', value: '1,842', detail: 'transactions', icon: 'transactions', tone: 'green' },
    ],
    insights: [{ label: 'Monthly ROI', value: '+21.6', suffix: '%' }, { label: 'Gas saved', value: '8,940', suffix: 'USD' }],
  },
  demo: {
    id: 'demo',
    chipLabel: '0x1A2B...C4D5',
    profile: { name: 'Crypto Champ', wallet: '0x1A2B...C4D5', avatar: 'cebc058af93e566c96200932c258f395cbf87ebd.png' },
    balance: {
      value: '$12,500',
      growth: '+12.4% this month',
      rank: 'Top 10%',
      stats: [
        { label: 'Wallet Rank', value: 'Top 10%', icon: 'rank' },
        { label: 'Activity', value: 'High', icon: 'activity' },
        { label: 'Risk', value: 'Low', icon: 'risk' },
        { label: 'Networks', value: '5', icon: 'network' },
      ],
    },
    portfolio: {
      status: 'Excellent',
      score: 92,
      metrics: [
        { label: 'Portfolio Value', value: '8.4 ETH', detail: '≈ $21,500', icon: 'wallet', primary: true },
        { label: 'NFT Count', value: '42', detail: 'Items collected', icon: 'nft' },
        { label: 'DeFi Stake', value: '$500', detail: 'Currently staked', icon: 'defi' },
        { label: 'Collection', value: 'BAYC', detail: 'Bored Ape Yacht Club', icon: 'collection' },
      ],
    },
    identity: [
      { label: 'Portfolio Score', value: '98/100', description: 'Excellent financial reputation', icon: 'portfolio', tone: 'gold' },
      { label: 'Risk Score', value: '92/100', description: 'Low-risk wallet behavior', icon: 'risk', tone: 'blue' },
      { label: 'Account Age', value: '3 years 4 months', description: 'Established wallet history', icon: 'age', tone: 'purple' },
      { label: 'KYC Status', value: 'Tier 3 Verified', description: 'Account status: Active', icon: 'kyc', tone: 'green' },
    ],
    personality: {
      title: 'NFT Collector',
      description: 'Your wallet behavior is primarily shaped by digital collectibles.',
      traits: [
        { label: 'NFT Collector', value: 70, icon: '99_918.svg', tone: 'primary' },
        { label: 'DeFi Explorer', value: 20, icon: '99_938.svg', tone: 'blue' },
        { label: 'Trader', value: 10, icon: '99_917.svg', tone: 'green' },
      ],
    },
    ai: {
      summary: 'This wallet behaves like a long-term NFT collector.',
      confidence: 'High-confidence pattern',
      insights: [
        { text: 'Most activity occurs on Ethereum.', detail: 'Primary network', icon: 'network', tone: 'blue' },
        { text: 'Risk level is below average.', detail: 'Healthy behavior', icon: 'risk', tone: 'green' },
        { text: 'Portfolio growth accelerated this month.', detail: '+12.4% monthly', icon: 'growth', tone: 'teal' },
      ],
    },
    flow: {
      received: { value: '+$4,200', percent: 62 },
      spent: { value: '-$1,500', percent: 22 },
      categories: [
        { label: 'NFTs', value: '$3,200', percent: 45, tone: 'mint', icon: '99_918.svg' },
        { label: 'DeFi', value: '$2,100', percent: 30, tone: 'blue', icon: '99_938.svg' },
        { label: 'Transfers', value: '$1,100', percent: 15, tone: 'green', icon: '99_917.svg' },
        { label: 'Gas & Fees', value: '$700', percent: 10, tone: 'red', icon: '99_969.svg' },
      ],
    },
    transactions: [
      transaction('Received ETH', '2 hours ago', '+$2,048.50', '0.8 ETH', 'Coinbase', 'Ethereum', 'green', '99_875.svg', true),
      transaction('Purchased Azuki #421', 'Yesterday', '-$10,750', '4.2 ETH', 'OpenSea', 'Ethereum', 'mint', '99_896.svg'),
      transaction('Swap ETH → USDC', '4 days ago', '3,072 USDC', '1.2 ETH', 'Uniswap', 'Ethereum', 'blue', '99_917.svg'),
    ],
    highlights: [
      { label: 'Largest Holding', value: 'ETH', detail: '65%', icon: 'holding', tone: 'violet' },
      { label: 'Top Protocol', value: 'Uniswap', detail: '$4,200', icon: 'protocol', tone: 'pink' },
      { label: 'Most Active Chain', value: 'Ethereum', detail: '78%', icon: 'chain', tone: 'blue' },
      { label: 'Monthly Transactions', value: '248', detail: 'transactions', icon: 'transactions', tone: 'green' },
    ],
    insights: [{ label: 'Monthly ROI', value: '+12.4', suffix: '%' }, { label: 'Gas saved', value: '240.50', suffix: 'USD' }],
  },
}

export const defaultWalletId = 'demo'

export const getMockWallet = (walletId) => new Promise((resolve) => {
  window.setTimeout(() => resolve(mockWallets[walletId]), 500)
})
