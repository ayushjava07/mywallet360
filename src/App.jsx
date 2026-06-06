import { useEffect, useRef, useState } from 'react'
import { Icon as IconifyIcon } from '@iconify/react'
import {
  Activity as ActivityIcon,
  ArrowLeftRight,
  Bell,
  ChevronDown,
  CircleDollarSign,
  Gem,
  Images,
  Landmark,
  Layers3,
  Moon,
  Network,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  Sun,
  WalletCards,
} from 'lucide-react'
import calendar3d from '@iconify-icons/fluent-emoji/calendar'
import crystalBall3d from '@iconify-icons/fluent-emoji/crystal-ball'
import globe3d from '@iconify-icons/fluent-emoji/globe-with-meridians'
import identificationCard3d from '@iconify-icons/fluent-emoji/identification-card'
import rocket3d from '@iconify-icons/fluent-emoji/rocket'
import shield3d from '@iconify-icons/fluent-emoji/shield'
import trophy3d from '@iconify-icons/fluent-emoji/trophy'
import { defaultWalletId, getMockWallet, mockWallets } from './mockWallets'

const asset = (name) => `/images/${name}`

const navItems = [
  { label: 'Overview', icon: '99_1001.svg' },
  { label: 'Money Flow', icon: '99_1008.svg' },
  { label: 'Portfolio', icon: '99_1015.svg' },
  { label: 'Insights', icon: '99_1022.svg' },
]

const metricIcons = { rank: Trophy, activity: ActivityIcon, risk: ShieldCheck, network: Network }
const portfolioIcons = { wallet: WalletCards, nft: Images, defi: Landmark, collection: Gem }
const identityIcons = { portfolio: trophy3d, risk: shield3d, age: calendar3d, kyc: identificationCard3d }
const aiIcons = { network: globe3d, risk: shield3d, growth: rocket3d }
const highlightIcons = { holding: CircleDollarSign, protocol: Layers3, chain: Radio, transactions: ArrowLeftRight }

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

function Header({ wallet, selectedWalletId, searchValue, onSearchChange, onSelectWallet, isLoading, theme, onToggleTheme }) {
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleSearchShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }

      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        onSearchChange('')
        searchInputRef.current.blur()
      }
    }

    window.addEventListener('keydown', handleSearchShortcut)
    return () => window.removeEventListener('keydown', handleSearchShortcut)
  }, [onSearchChange])

  return (
    <header className="header">
      <div className="profile header__profile">
        <div className="profile__image-wrap">
          <img
            className="profile__image"
            src={asset(wallet.profile.avatar)}
            alt={`${wallet.profile.name} profile`}
          />
          <span className="profile__status" aria-label="Online" />
        </div>
        <div>
          <span className="eyebrow">Welcome back,</span>
          <h1>{wallet.profile.name}</h1>
        </div>
      </div>
      <div className="wallet-search-area">
        <label className="global-search">
          <Search aria-hidden="true" />
          <input ref={searchInputRef} value={searchValue} onChange={(event) => onSearchChange(event.target.value)} type="search" placeholder="Search wallet, token, ENS, transaction..." aria-label="Global search" />
          <kbd><span>Ctrl</span><span>K</span></kbd>
        </label>
        <div className="demo-wallets">
          <span>Try Demo Wallets</span>
          <div>
            {Object.values(mockWallets).map((demoWallet) => (
              <button className={selectedWalletId === demoWallet.id ? 'active' : ''} disabled={isLoading} type="button" onClick={() => onSelectWallet(demoWallet.id)} key={demoWallet.id}>
                {demoWallet.chipLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="header__actions">
        <button className="icon-button" type="button" aria-label="View notifications">
          <Bell aria-hidden="true" />
          <span className="notification-dot" />
        </button>
        <button className="icon-button theme-toggle" type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'} onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>
        <button className="wallet-pill" type="button" aria-label={`Connected wallet ${wallet.profile.wallet}`}>
          <span className="wallet-pill__dot" />
          <span className="wallet-pill__copy">
            <strong>Connected</strong>
            <small>{wallet.profile.wallet}</small>
          </span>
          <ChevronDown aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

function IdentityCard({ stats }) {
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
        {stats.map((stat) => (
          <article className={`stat stat--${stat.tone}`} key={stat.label}>
            <span className="stat__icon stat__icon--3d"><ThreeDIcon icon={identityIcons[stat.icon]} /></span>
            <div className="stat__content">
              <span className="stat__name">{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.description}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function WalletPersonality({ personality }) {
  const primaryTrait = personality.traits[0]
  const secondaryEnd = primaryTrait.value + personality.traits[1].value
  const orbitStyle = {
    background: `conic-gradient(var(--primary) 0 ${primaryTrait.value}%, var(--secondary) ${primaryTrait.value}% ${secondaryEnd}%, var(--accent) ${secondaryEnd}% 100%)`,
  }
  return (
    <section className="card personality-card">
      <div className="personality-card__intro">
        <span className="personality-card__eyebrow">Wallet Personality</span>
        <div className="personality-card__title">
          <div>
            <h2>{personality.title}</h2>
            <p>{personality.description}</p>
          </div>
          <div className="personality-orbit" style={orbitStyle} aria-label={`${primaryTrait.label} ${primaryTrait.value}%`}>
            <div><strong>{primaryTrait.value}%</strong><span>Primary trait</span></div>
          </div>
        </div>
      </div>
      <div className="personality-list">
        {personality.traits.map((trait) => (
          <article className={`personality-item personality-item--${trait.tone}`} key={trait.label}>
            <span className="personality-item__icon"><Icon name={trait.icon} alt="" /></span>
            <div className="personality-item__body">
              <div className="personality-item__heading">
                <strong>{trait.label}</strong>
                <span>{trait.value}%</span>
              </div>
              <div className="personality-meter" aria-hidden="true">
                <i style={{ width: `${trait.value}%` }} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AIInsights({ ai }) {
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
        <p>{ai.summary}</p>
        <span className="ai-card__confidence">{ai.confidence}</span>
      </div>
      <div className="ai-card__insights">
        {ai.insights.map((insight, index) => (
          <article className={`ai-insight ai-insight--${insight.tone}${index === 0 ? ' ai-insight--highlighted' : ''}`} key={insight.text}>
            <span className="ai-insight__icon ai-insight__icon--3d"><ThreeDIcon icon={aiIcons[insight.icon]} /></span>
            <div><strong>{insight.text}</strong><span>{insight.detail}</span></div>
          </article>
        ))}
      </div>
    </section>
  )
}

function BalanceCard({ balance }) {
  return (
    <section className="balance-card">
      <span className="balance-card__glass" aria-hidden="true" />
      <span className="balance-rank-chip"><Trophy aria-hidden="true" /> {balance.rank}</span>
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
        <h2>{balance.value}</h2>
        <span className="growth-pill"><TrendingUp aria-hidden="true" />{balance.growth}</span>
      </div>
      <div className="balance-stats">
        {balance.stats.map((stat) => {
          const StatIcon = metricIcons[stat.icon]
          return (
          <div className="balance-stat" key={stat.label}>
            <span className="balance-stat__icon"><StatIcon aria-hidden="true" /></span>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
          )
        })}
      </div>
    </section>
  )
}

function PortfolioCard({ portfolio }) {
  return (
    <section className="card portfolio-card">
      <div className="portfolio-card__heading">
        <div><span>Wallet intelligence</span><h2>Portfolio Snapshot</h2></div>
        <span className="portfolio-status"><i /> {portfolio.status}</span>
      </div>
      <div className="portfolio-grid">
        {portfolio.metrics.map((metric) => {
          const MetricIcon = portfolioIcons[metric.icon]
          return (
            <article className={`portfolio-metric${metric.primary ? ' portfolio-metric--primary' : ''}`} key={metric.label}>
              <span className="portfolio-metric__icon"><MetricIcon aria-hidden="true" /></span>
              <span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small>
            </article>
          )
        })}
      </div>
      <div className="score-bar">
        <span className="score-bar__icon"><Sparkles aria-hidden="true" /></span>
        <div className="score-bar__copy"><span>Portfolio Score</span><strong>Excellent</strong></div>
        <strong className="score-bar__value">{portfolio.score}<small>/100</small></strong>
        <div className="score-bar__meter" aria-hidden="true"><i style={{ width: `${portfolio.score}%` }} /></div>
      </div>
    </section>
  )
}

function FlowCard({ direction, data }) {
  const incoming = direction === 'in'
  return (
    <article className={`card flow-card flow-card--${incoming ? 'received' : 'spent'}`}>
      <div className="flow-card__top">
        <span className={`icon-box ${incoming ? 'green' : 'red'}`}>
          <Icon name={incoming ? '99_740.svg' : '99_756.svg'} alt="" />
        </span>
        <div>
          <strong className={incoming ? 'positive' : ''}>{data.value}</strong>
          <span>{data.percent}% of volume</span>
        </div>
      </div>
      <h3>{incoming ? 'Money Received' : 'Money Spent'}</h3>
      <div className="progress"><i className={incoming ? 'green' : 'red'} style={{ width: `${data.percent}%` }} /></div>
    </article>
  )
}

function Summary({ flow }) {
  return (
    <section className="summary">
      <SectionLabel>Summary</SectionLabel>
      <div className="summary__heading">
        <div><h2>This Month</h2><span>Wallet Money Flow Report</span></div>
        <span>Where did my money go?</span>
      </div>
      <div className="flow-grid"><FlowCard direction="in" data={flow.received} /><FlowCard direction="out" data={flow.spent} /></div>
      <div className="breakdown-section">
        <div className="breakdown-section__heading">
          <strong>Spending Breakdown</strong>
          <span>By category</span>
        </div>
        <div className="category-grid">
          {flow.categories.map((category) => (
            <article className={`card category-card category-card--${category.tone}`} key={category.label}>
              <div><span className={`icon-box icon-box--small ${category.tone}`}><Icon name={category.icon} alt="" size="sm" /></span><strong>{category.label}</strong></div>
              <div><strong>{category.value}</strong><span>{category.percent}%</span></div>
              <div className="category-progress" aria-hidden="true"><i style={{ width: `${category.percent}%` }} /></div>
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

function Activity({ transactions, highlights }) {
  const [showAll, setShowAll] = useState(false)
  const visibleTransactions = showAll ? transactions : transactions.slice(0, 3)
  return (
    <section className="activity">
      <div className="activity-layout">
        <div className="card activity-feed">
          <div className="activity-card__heading">
            <div><span>Wallet timeline</span><h2>Recent Activity</h2></div>
            <button type="button" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Show Less' : 'See All'}</button>
          </div>
          <div className="transaction-list">
            {visibleTransactions.map((item) => (
              <article className={`transaction transaction--${item.tone}`} tabIndex="0" key={item.title}>
                <div className="transaction__visual">
                  <span className={`icon-box ${item.tone}`}><Icon name={item.icon} alt="" /></span>
                  <span className={`protocol-logo protocol-logo--${item.tone}`} title={item.protocol}>{item.protocolMark}</span>
                </div>
                <div className="transaction__main">
                  <strong>{item.displayTitle}</strong>
                  <div className="transaction__context">
                    <span className="transaction__protocol">{item.protocol}</span>
                    <span aria-hidden="true">•</span>
                    <span className="chain-badge">{item.chain}</span>
                  </div>
                </div>
                <div className="transaction__amount">
                  <strong className={item.positive ? 'positive' : ''}>{item.amount}</strong>
                  <span>{item.crypto}</span>
                </div>
                <span className="transaction__time">{item.meta}</span>
              </article>
            ))}
          </div>
        </div>
        <aside className="card highlights-card">
          <div className="activity-card__heading">
            <div><span>Wallet intelligence</span><h2>Key Highlights</h2></div>
          </div>
          <div className="highlights-list">
            {highlights.map((highlight) => {
              const HighlightIcon = highlightIcons[highlight.icon]
              return (
              <article className={`highlight-item highlight-item--${highlight.tone}`} key={highlight.label}>
                <span className="highlight-item__icon"><HighlightIcon aria-hidden="true" /></span>
                <div>
                  <span>{highlight.label}</span>
                  <strong>{highlight.value} <small>• {highlight.detail}</small></strong>
                </div>
              </article>
              )
            })}
          </div>
        </aside>
      </div>
    </section>
  )
}

function Insights({ insights }) {
  return (
    <section className="insights-grid">
      {insights.map((insight, index) => (
        <article className="card insight-card" key={insight.label}>
          <span className={`icon-box ${index === 0 ? 'teal' : 'blue'}`}><Icon name={index === 0 ? '99_959.svg' : '99_969.svg'} alt="" /></span>
          <span>{insight.label}</span>
          <strong>{insight.suffix === 'USD' && <small>$</small>} {insight.value} {insight.suffix !== 'USD' && <small>{insight.suffix}</small>}</strong>
        </article>
      ))}
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
  const [selectedWalletId, setSelectedWalletId] = useState(defaultWalletId)
  const [wallet, setWallet] = useState(mockWallets[defaultWalletId])
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('mywallet360-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0f14' : '#f8f7fc')
    window.localStorage.setItem('mywallet360-theme', theme)
  }, [theme])

  const selectWallet = async (walletId) => {
    if (isLoading || walletId === selectedWalletId) return
    setIsLoading(true)
    setSearchValue(mockWallets[walletId].chipLabel)
    const nextWallet = await getMockWallet(walletId)
    setSelectedWalletId(walletId)
    setWallet(nextWallet)
    setIsLoading(false)
  }

  const toggleTheme = () => {
    const updateTheme = () => setTheme((value) => value === 'dark' ? 'light' : 'dark')

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updateTheme()
      return
    }

    document.startViewTransition(updateTheme)
  }

  return (
    <div className="app-shell">
      <Header wallet={wallet} selectedWalletId={selectedWalletId} searchValue={searchValue} onSearchChange={setSearchValue} onSelectWallet={selectWallet} isLoading={isLoading} theme={theme} onToggleTheme={toggleTheme} />
      <main className={isLoading ? 'dashboard-loading' : 'dashboard-ready'} key={wallet.id}>
        {isLoading && <div className="dashboard-loader" role="status"><span /><strong>Loading wallet intelligence...</strong></div>}
        <div className="dashboard-grid dashboard-grid--top"><BalanceCard balance={wallet.balance} /><PortfolioCard portfolio={wallet.portfolio} /><IdentityCard stats={wallet.identity} /><WalletPersonality personality={wallet.personality} /></div>
        <AIInsights ai={wallet.ai} />
        <Summary flow={wallet.flow} />
        <Activity transactions={wallet.transactions} highlights={wallet.highlights} />
        <Insights insights={wallet.insights} />
      </main>
      <BottomNav />
    </div>
  )
}
