import { useState } from 'react'
import { Icon as IconifyIcon } from '@iconify/react'
import {
  Activity as ActivityIcon,
  Bell,
  ChevronDown,
  Gem,
  Images,
  Landmark,
  Moon,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  WalletCards,
} from 'lucide-react'
import calendar3d from '@iconify-icons/fluent-emoji/calendar'
import checkMark3d from '@iconify-icons/fluent-emoji/check-mark-button'
import crystalBall3d from '@iconify-icons/fluent-emoji/crystal-ball'
import globe3d from '@iconify-icons/fluent-emoji/globe-with-meridians'
import identificationCard3d from '@iconify-icons/fluent-emoji/identification-card'
import rocket3d from '@iconify-icons/fluent-emoji/rocket'
import shield3d from '@iconify-icons/fluent-emoji/shield'
import trophy3d from '@iconify-icons/fluent-emoji/trophy'

const asset = (name) => `/images/${name}`

const transactions = [
  {
    type: 'Receive',
    displayTitle: 'Received ETH',
    title: '0.8 ETH from Coinbase',
    meta: '2 hours ago',
    amount: '+$2,048.50',
    crypto: '0.8 ETH',
    icon: '99_875.svg',
    tone: 'green',
    positive: true,
    protocol: 'Coinbase',
    protocolMark: 'C',
    chain: 'Ethereum',
    status: 'Confirmed',
  },
  {
    type: 'Purchase',
    displayTitle: 'Purchased Azuki #421',
    title: 'Azuki #421',
    meta: 'Yesterday · OpenSea',
    amount: '-$10,750',
    crypto: '4.2 ETH',
    icon: '99_896.svg',
    tone: 'mint',
    protocol: 'OpenSea',
    protocolMark: 'O',
    chain: 'Ethereum',
    status: 'Confirmed',
  },
  {
    type: 'Swap',
    displayTitle: 'Swap ETH → USDC',
    title: 'ETH → USDC',
    meta: '4 days ago · Uniswap',
    amount: '3,072 USDC',
    crypto: '1.2 ETH',
    icon: '99_917.svg',
    tone: 'blue',
    protocol: 'Uniswap',
    protocolMark: 'U',
    chain: 'Ethereum',
    status: 'Confirmed',
  },
]

const navItems = [
  { label: 'Overview', icon: '99_1001.svg' },
  { label: 'Money Flow', icon: '99_1008.svg' },
  { label: 'Portfolio', icon: '99_1015.svg' },
  { label: 'Insights', icon: '99_1022.svg' },
]

const identityStats = [
  { label: 'Account Status', value: 'Active', badge: 'active', icon3d: checkMark3d, tone: 'green' },
  { label: 'Account Age', value: '3 years 4 months', icon3d: calendar3d, tone: 'secondary' },
  { label: 'KYC Status', value: 'Tier 3', badge: 'verified', icon3d: identificationCard3d, tone: 'blue' },
  { label: 'Risk Score', value: '92%', icon3d: shield3d, tone: 'amber', featured: true },
  { label: 'Portfolio Score', value: '98/100', icon3d: trophy3d, tone: 'teal', featured: true },
]

const walletPersonalities = [
  { label: 'NFT Collector', value: 70, icon: '99_918.svg', tone: 'primary' },
  { label: 'DeFi Explorer', value: 20, icon: '99_938.svg', tone: 'blue' },
  { label: 'Trader', value: 10, icon: '99_917.svg', tone: 'green' },
]

const aiInsights = [
  { text: 'Most activity occurs on Ethereum.', detail: 'Primary network', icon3d: globe3d, tone: 'blue' },
  { text: 'Risk level is below average.', detail: 'Healthy behavior', icon3d: shield3d, tone: 'green' },
  { text: 'Portfolio growth accelerated this month.', detail: '+12.4% monthly', icon3d: rocket3d, tone: 'teal' },
]

const balanceStats = [
  { label: 'Wallet Rank', value: 'Top 10%', icon: Trophy },
  { label: 'Activity', value: 'High', icon: ActivityIcon },
  { label: 'Risk', value: 'Low', icon: ShieldCheck },
  { label: 'Networks', value: '5', icon: Network },
]

const flowCategories = [
  { label: 'NFTs', value: '$3,200', percent: '45%', tone: 'mint', icon: '99_918.svg' },
  { label: 'DeFi', value: '$2,100', percent: '30%', tone: 'blue', icon: '99_938.svg' },
  { label: 'Transfers', value: '$1,100', percent: '15%', tone: 'green', icon: '99_917.svg' },
  { label: 'Gas & Fees', value: '$700', percent: '10%', tone: 'red', icon: '99_969.svg' },
]

function SectionLabel({ children, action }) {
  return (
    <div className="section-label">
      <strong>{children}</strong>
      {action}
    </div>
  )
}

function Icon({ name, alt = '', size = 'md' }) {
  const useFallback = (event) => {
    event.currentTarget.onerror = null
    event.currentTarget.src = asset('99_672.svg')
  }

  return <img className={`icon icon--${size}`} src={asset(name)} alt={alt} onError={useFallback} />
}

function ThreeDIcon({ icon, label = '' }) {
  return <IconifyIcon className="icon-3d" icon={icon} aria-label={label || undefined} aria-hidden={!label} />
}

function Header() {
  return (
    <header className="header">
      <div className="profile header__profile">
        <div className="profile__image-wrap">
          <img
            className="profile__image"
            src={asset('cebc058af93e566c96200932c258f395cbf87ebd.png')}
            alt="Crypto Champ profile"
          />
          <span className="profile__status" aria-label="Online" />
        </div>
        <div>
          <span className="eyebrow">Welcome back,</span>
          <h1>Crypto Champ</h1>
        </div>
      </div>
      <label className="global-search">
        <Search aria-hidden="true" />
        <input type="search" placeholder="Search wallet, token, ENS, transaction..." aria-label="Global search" />
        <kbd><span>Ctrl</span><span>K</span></kbd>
      </label>
      <div className="header__actions">
        <button className="icon-button" type="button" aria-label="View notifications">
          <Bell aria-hidden="true" />
          <span className="notification-dot" />
        </button>
        <button className="icon-button" type="button" aria-label="Toggle theme">
          <Moon aria-hidden="true" />
        </button>
        <button className="wallet-pill" type="button" aria-label="Connected wallet 0x12...C4D5">
          <span className="wallet-pill__dot" />
          <span className="wallet-pill__copy">
            <strong>Connected</strong>
            <small>0x12...C4D5</small>
          </span>
          <ChevronDown aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

function IdentityCard() {
  return (
    <section className="card identity-card">
      <div className="card-heading">
        <div className="title-with-icon">
          <span className="icon-box icon-box--3d"><ThreeDIcon icon={identificationCard3d} /></span>
          <h2>Financial Identity Profile</h2>
        </div>
        <span className="pill pill--verified">Verified</span>
      </div>
      <div className="identity-grid">
        {identityStats.map((stat) => (
          <div className={`stat stat--${stat.tone}${stat.featured ? ' stat--featured' : ''}`} key={stat.label}>
            <span className="stat__label">
              <span className="stat__icon stat__icon--3d"><ThreeDIcon icon={stat.icon3d} /></span>
              <span className="stat__name">{stat.label}</span>
            </span>
            {stat.badge ? (
              <span className={`pill pill--${stat.badge}`}>{stat.value}</span>
            ) : (
              <strong>{stat.value}</strong>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function WalletPersonality() {
  return (
    <section className="card personality-card">
      <div className="personality-card__intro">
        <span className="personality-card__eyebrow">Wallet Personality</span>
        <div className="personality-card__title">
          <div>
            <h2>NFT Collector</h2>
            <p>Your wallet behavior is primarily shaped by digital collectibles.</p>
          </div>
          <div className="personality-orbit" aria-label="NFT Collector 70%, DeFi Explorer 20%, Trader 10%">
            <div><strong>70%</strong><span>Primary trait</span></div>
          </div>
        </div>
      </div>
      <div className="personality-list">
        {walletPersonalities.map((personality) => (
          <article className={`personality-item personality-item--${personality.tone}`} key={personality.label}>
            <span className="personality-item__icon"><Icon name={personality.icon} alt="" /></span>
            <div className="personality-item__body">
              <div className="personality-item__heading">
                <strong>{personality.label}</strong>
                <span>{personality.value}%</span>
              </div>
              <div className="personality-meter" aria-hidden="true">
                <i style={{ width: `${personality.value}%` }} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AIInsights() {
  return (
    <section className="card ai-card">
      <div className="ai-card__lead">
        <div className="ai-card__heading">
          <span className="ai-card__mark"><ThreeDIcon icon={crystalBall3d} /></span>
          <div>
            <span>AI Insights</span>
            <h2>Wallet intelligence, explained simply.</h2>
          </div>
        </div>
        <p>This wallet behaves like a long-term NFT collector.</p>
        <span className="ai-card__confidence">High-confidence pattern</span>
      </div>
      <div className="ai-card__insights">
        {aiInsights.map((insight, index) => (
          <article className={`ai-insight ai-insight--${insight.tone}${index === 0 ? ' ai-insight--highlighted' : ''}`} key={insight.text}>
            <span className="ai-insight__icon ai-insight__icon--3d"><ThreeDIcon icon={insight.icon3d} /></span>
            <div><strong>{insight.text}</strong><span>{insight.detail}</span></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function BalanceCard() {
  return (
    <section className="balance-card">
      <span className="balance-card__glass" aria-hidden="true" />
      <span className="balance-rank-chip"><Trophy aria-hidden="true" /> Top 10%</span>
      <svg
        className="balance-sparkline"
        viewBox="0 0 600 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sparklineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity=".12" />
          </linearGradient>
          <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="balance-sparkline__fill"
          d="M0 190 C45 175 65 184 102 158 S160 143 196 150 S250 123 286 132 S338 104 374 112 S421 81 460 91 S522 53 600 38 L600 220 L0 220 Z"
        />
        <path
          className="balance-sparkline__line"
          d="M0 190 C45 175 65 184 102 158 S160 143 196 150 S250 123 286 132 S338 104 374 112 S421 81 460 91 S522 53 600 38"
        />
      </svg>
      <div className="balance-card__main">
        <span className="eyebrow eyebrow--light">Total net worth</span>
        <h2>$12,500</h2>
        <span className="growth-pill"><TrendingUp aria-hidden="true" />+12.4% this month</span>
      </div>
      <div className="balance-stats">
        {balanceStats.map((stat) => (
          <div className="balance-stat" key={stat.label}>
            <span className="balance-stat__icon"><stat.icon aria-hidden="true" /></span>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function PortfolioCard() {
  return (
    <section className="card portfolio-card">
      <div className="portfolio-card__heading">
        <div><span>Wallet intelligence</span><h2>Portfolio Snapshot</h2></div>
        <span className="portfolio-status"><i /> Excellent</span>
      </div>
      <div className="portfolio-grid">
        <article className="portfolio-metric portfolio-metric--primary">
          <span className="portfolio-metric__icon"><WalletCards aria-hidden="true" /></span>
          <span>Portfolio Value</span>
          <strong>8.4 ETH</strong>
          <small>≈ $21,500</small>
        </article>
        <article className="portfolio-metric">
          <span className="portfolio-metric__icon"><Images aria-hidden="true" /></span>
          <span>NFT Count</span>
          <strong>42</strong>
          <small>Items collected</small>
        </article>
        <article className="portfolio-metric">
          <span className="portfolio-metric__icon"><Landmark aria-hidden="true" /></span>
          <span>DeFi Stake</span>
          <strong>$500</strong>
          <small>Currently staked</small>
        </article>
        <article className="portfolio-metric">
          <span className="portfolio-metric__icon"><Gem aria-hidden="true" /></span>
          <span>Collection</span>
          <strong>BAYC</strong>
          <small>Bored Ape Yacht Club</small>
        </article>
      </div>
      <div className="score-bar">
        <span className="score-bar__icon"><Sparkles aria-hidden="true" /></span>
        <div className="score-bar__copy"><span>Portfolio Score</span><strong>Excellent</strong></div>
        <strong className="score-bar__value">92<small>/100</small></strong>
        <div className="score-bar__meter" aria-hidden="true"><i /></div>
      </div>
    </section>
  )
}

function FlowCard({ direction }) {
  const incoming = direction === 'in'
  return (
    <article className={`card flow-card flow-card--${incoming ? 'received' : 'spent'}`}>
      <div className="flow-card__top">
        <span className={`icon-box ${incoming ? 'green' : 'red'}`}>
          <Icon name={incoming ? '99_740.svg' : '99_756.svg'} alt="" />
        </span>
        <div>
          <strong className={incoming ? 'positive' : ''}>{incoming ? '+$4,200' : '-$1,500'}</strong>
          <span>{incoming ? '62%' : '22%'} of volume</span>
        </div>
      </div>
      <h3>{incoming ? 'Money Received' : 'Money Spent'}</h3>
      <div className="progress"><i className={incoming ? 'green' : 'red'} style={{ width: incoming ? '62%' : '22%' }} /></div>
    </article>
  )
}

function Summary() {
  return (
    <section className="summary">
      <SectionLabel>Summary</SectionLabel>
      <div className="summary__heading">
        <div><h2>This Month</h2><span>Wallet Money Flow Report</span></div>
        <span>Where did my money go?</span>
      </div>
      <div className="flow-grid"><FlowCard direction="in" /><FlowCard direction="out" /></div>
      <div className="breakdown-section">
        <div className="breakdown-section__heading">
          <strong>Spending Breakdown</strong>
          <span>By category</span>
        </div>
        <div className="category-grid">
          {flowCategories.map((category) => (
            <article className={`card category-card category-card--${category.tone}`} key={category.label}>
              <div><span className={`icon-box icon-box--small ${category.tone}`}><Icon name={category.icon} alt="" size="sm" /></span><strong>{category.label}</strong></div>
              <div><strong>{category.value}</strong><span>{category.percent}</span></div>
              <div className="category-progress" aria-hidden="true"><i style={{ width: category.percent }} /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function SpendingCard() {
  const breakdown = [
    { label: 'NFTs', value: '45%', tone: 'teal-light', icon: '99_918.svg', insight: 'Highest category' },
    { label: 'DeFi', value: '30%', tone: 'teal-dark', icon: '99_938.svg', insight: 'Second highest' },
    { label: 'Transfers', value: '15%', tone: 'blue', icon: '99_917.svg', insight: 'Stable activity' },
    { label: 'Other', value: '10%', tone: 'green', icon: '99_969.svg', insight: 'Lowest category' },
  ]
  return (
    <article className="card spending-card">
      <div className="spending-card__chart">
        <div className="donut" aria-label="Spending total $1,500">
          <div><span>Total</span><strong>$1,500</strong></div>
        </div>
        <span>4 categories tracked</span>
      </div>
      <div className="spending-card__content">
        <h3>Where did my money go?</h3>
        <span>Spending Breakdown</span>
        <div className="breakdown-grid">
          {breakdown.map((item) => (
            <div className={`breakdown breakdown--${item.tone}`} key={item.label}>
              <span className="breakdown__icon"><Icon name={item.icon} alt="" size="sm" /></span>
              <div className="breakdown__copy">
                <span>{item.label}</span>
                <small>{item.insight}</small>
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

function Activity() {
  const [showAll, setShowAll] = useState(false)
  const visibleTransactions = showAll ? transactions : transactions.slice(0, 3)
  return (
    <section className="activity">
      <SectionLabel action={<button type="button" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Show Less' : 'See All'}</button>}>Recent Activity</SectionLabel>
      <SpendingCard />
      <div className="transaction-list">
        {visibleTransactions.map((item) => (
          <article className={`card transaction transaction--${item.tone}`} tabIndex="0" key={item.title}>
            <div className="transaction__visual">
              <span className={`icon-box ${item.tone}`}><Icon name={item.icon} alt="" /></span>
              <span className={`protocol-logo protocol-logo--${item.tone}`} title={item.protocol}>{item.protocolMark}</span>
            </div>
            <div className="transaction__main">
              <div className="transaction__labels">
                <span className="transaction__type">{item.type}</span>
                <span className={`status-chip status-chip--${item.pending ? 'pending' : 'confirmed'}`}>{item.status}</span>
              </div>
              <strong>{item.displayTitle}</strong>
              <div className="transaction__context">
                <span className="transaction__protocol">{item.protocol}</span>
                <span aria-hidden="true">•</span>
                <span className="chain-badge">{item.chain}</span>
                <span className="transaction__time">{item.meta}</span>
              </div>
            </div>
            <div className="transaction__amount">
              <strong className={item.positive ? 'positive' : ''}>{item.amount}</strong>
              <span>{item.crypto}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Insights() {
  return (
    <section className="insights-grid">
      <article className="card insight-card"><span className="icon-box teal"><Icon name="99_959.svg" alt="" /></span><span>Monthly ROI</span><strong>+12.4 <small>%</small></strong></article>
      <article className="card insight-card"><span className="icon-box blue"><Icon name="99_969.svg" alt="" /></span><span>Gas saved</span><strong><small>$</small> 240.50</strong></article>
    </section>
  )
}

function BottomNav() {
  const [active, setActive] = useState('Overview')
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map((item) => (
        <button className={active === item.label ? 'active' : ''} type="button" onClick={() => setActive(item.label)} key={item.label}>
          <span><Icon name={item.icon} alt="" /></span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <div className="dashboard-grid dashboard-grid--top"><BalanceCard /><PortfolioCard /><IdentityCard /><WalletPersonality /></div>
        <AIInsights />
        <Summary />
        <Activity />
        <Insights />
      </main>
      <BottomNav />
    </div>
  )
}
