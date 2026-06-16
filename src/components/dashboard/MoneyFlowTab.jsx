import { MaterialIcon } from '../common/MaterialIcon'

function formatPeriod(periodLabel) {
  const d = new Date()
  return (periodLabel || d.toLocaleString('en-US', { month: 'long', year: 'numeric' })).toUpperCase()
}

function netGrowthValue(flow) {
  const recv = parseFloat(flow.received.value.replace(/[^0-9.\-]/g, '')) || 0
  const spent = parseFloat(flow.spent.value.replace(/[^0-9.\-]/g, '')) || 0
  return recv - spent
}

function currencySymbol(flow) {
  const match = flow.received.value.replace(/[0-9,.\-]/g, '').trim()
  return match || 'USD'
}

const TX_CONFIG = {
  Receive: { icon: 'call_received', color: 'text-emerald-500', bg: 'bg-emerald-500/10', badge: 'Received' },
  Send: { icon: 'call_made', color: 'text-rose-500', bg: 'bg-rose-500/10', badge: 'Sent' },
}

function getTxConfig(tx) {
  const title = tx.displayTitle || ''
  if (title === 'Token Swap') return { icon: 'swap_horiz', color: 'text-violet-500', bg: 'bg-violet-500/10', badge: 'Swapped' }
  if (title === 'Contract Interaction') return { icon: 'smart_toggle', color: 'text-orange-500', bg: 'bg-orange-500/10', badge: 'Confirmed' }
  if (title === 'Stake') return { icon: 'lock', color: 'text-blue-500', bg: 'bg-blue-500/10', badge: 'Staked' }
  return tx.positive ? TX_CONFIG.Receive : TX_CONFIG.Send
}

function getDateGroup(meta) {
  const m = meta.toLowerCase()
  if (m === 'just now' || m.includes('minute') || m.includes('hour')) return 'Today'
  if (m.startsWith('yesterday')) return 'Yesterday'
  if (m.includes('day')) {
    const days = parseInt(meta) || 0
    return days <= 6 ? 'This Week' : 'Older'
  }
  return 'Older'
}

export function MoneyFlowTab({ wallet }) {
  const { balance, flow, portfolio, transactions } = wallet
  const portfolioMetrics = portfolio.metrics || []
  const score = portfolio.score || 0
  const dashArray = `${Math.min(score, 100)} ${100 - Math.min(score, 100)}`

  const tip = (() => {
    const recv = parseFloat(flow.received.value.replace(/[^0-9.\-]/g, '')) || 0
    const spent = parseFloat(flow.spent.value.replace(/[^0-9.\-]/g, '')) || 0
    if (spent === 0) return 'All income retained this period. Excellent saving!'
    const ratio = Math.round(recv / spent)
    if (ratio >= 2) return `Great job! You received ${ratio}x more than you spent this period.`
    if (ratio >= 1) return 'You received slightly more than you spent. Keep it up!'
    return 'Your spending exceeded income this period. Review your expenses.'
  })()

  const topAsset = portfolioMetrics.find((m) => m.label === 'Largest Holding')?.value || 'ETH'
  const activityStat = balance.stats?.find((s) => s.label === 'Activity')
  const activityLevel = activityStat?.value || (score > 70 ? 'Highly Active' : score > 40 ? 'Active' : 'Moderate')
  const txnStat = balance.stats?.find((s) => s.label === 'Transactions')
  const totalTxns = txnStat?.value || '—'

  const portfolioValue = parseFloat(balance.value.replace(/[^0-9.]/g, '')) || 0

  const riskMetric = portfolioMetrics.find(m => m.label === 'Risk Level')
  const protocolMetric = portfolioMetrics.find(m => m.label === 'Most Used Protocol' || m.label === 'Most Used Contract')
  const protocolInteractions = parseInt(protocolMetric?.detail?.replace(/[^0-9]/g, '')) || 0

  const signals = [
    {
      label: 'Transaction Activity',
      value: totalTxns,
      strength: activityLevel === 'Very High' ? 'Strong' : activityLevel === 'High' ? 'Moderate' : 'Low',
      dotColor: activityLevel === 'Very High' ? 'bg-emerald-500' : activityLevel === 'High' ? 'bg-amber-500' : 'bg-slate-400',
      badgeClass: activityLevel === 'Very High' ? 'bg-emerald-500/10 text-emerald-500' : activityLevel === 'High' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500',
    },
    {
      label: 'Portfolio Value',
      value: balance.value,
      strength: portfolioValue > 50000 ? 'Strong' : portfolioValue > 10000 ? 'Moderate' : 'Developing',
      dotColor: portfolioValue > 50000 ? 'bg-emerald-500' : portfolioValue > 10000 ? 'bg-amber-500' : 'bg-slate-400',
      badgeClass: portfolioValue > 50000 ? 'bg-emerald-500/10 text-emerald-500' : portfolioValue > 10000 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500',
    },
    {
      label: 'Risk Profile',
      value: riskMetric?.value || '—',
      strength: riskMetric?.value === 'Low' ? 'Strong' : riskMetric?.value === 'Moderate' ? 'Moderate' : 'Needs Attention',
      dotColor: riskMetric?.value === 'Low' ? 'bg-emerald-500' : riskMetric?.value === 'Moderate' ? 'bg-amber-500' : 'bg-rose-500',
      badgeClass: riskMetric?.value === 'Low' ? 'bg-emerald-500/10 text-emerald-500' : riskMetric?.value === 'Moderate' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500',
      detail: riskMetric?.detail,
    },
    {
      label: 'Protocol Interactions',
      value: `${protocolInteractions} interactions`,
      strength: protocolInteractions > 5 ? 'Strong' : protocolInteractions > 2 ? 'Moderate' : 'Low',
      dotColor: protocolInteractions > 5 ? 'bg-emerald-500' : protocolInteractions > 2 ? 'bg-amber-500' : 'bg-slate-400',
      badgeClass: protocolInteractions > 5 ? 'bg-emerald-500/10 text-emerald-500' : protocolInteractions > 2 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500',
    },
  ]

  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : score >= 20 ? 'Limited' : 'Minimal'
  const strongCount = signals.filter(s => s.strength === 'Strong').length
  const attentionCount = signals.filter(s => s.strength === 'Needs Attention').length

  const strengthRank = { Strong: 4, Moderate: 3, Low: 2, Developing: 1, 'Needs Attention': 0 }
  const strongest = signals.reduce((best, s) => strengthRank[s.strength] > strengthRank[best.strength] ? s : best)
  const weakest = signals.reduce((best, s) => strengthRank[s.strength] < strengthRank[best.strength] ? s : best)

  const benchmarkLabel = score >= 95 ? 'Top 5% of wallets'
    : score >= 85 ? 'Top 15% of wallets'
    : score >= 70 ? 'Top 30% of wallets'
    : score >= 50 ? 'Above average'
    : 'Below average'

  const weaknessTip = weakest.strength === 'Needs Attention'
    ? `${weakest.label} requires attention. Reviewing your risk exposure could improve your score.`
    : (weakest.strength === 'Low' || weakest.strength === 'Developing')
    ? `Improving ${weakest.label.toLowerCase()} would strengthen your overall score.`
    : 'All factors are performing well. Maintain your current activity level.'

  const classificationDetail = score >= 80 ? 'Exceptional wallet health across all factors'
    : score >= 60 ? 'Above-average performance in most areas'
    : score >= 40 ? 'Moderate activity — room for improvement'
    : 'Limited activity — consider increasing wallet engagement'

  const scoreExplanation = score >= 80
    ? `Your score of ${score}/100 is ${scoreLabel.toLowerCase()}. ${strongCount} of 4 factors are performing at the highest level.`
    : score >= 60
    ? `Your score of ${score}/100 is ${scoreLabel.toLowerCase()}. ${strongCount} of 4 factors show above-average performance.`
    : score >= 40
    ? `Your score of ${score}/100 is ${scoreLabel.toLowerCase()}. Increasing transaction activity and protocol engagement could improve it.`
    : `Your score of ${score}/100 indicates ${scoreLabel.toLowerCase()} activity. Regular wallet usage across diverse protocols may help.`

  const recentTx = transactions.slice(0, 10)
  const groups = {}
  recentTx.forEach(tx => {
    const group = getDateGroup(tx.meta)
    if (!groups[group]) groups[group] = []
    groups[group].push(tx)
  })
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older']
  const groupedTransactions = groupOrder.filter(g => groups[g]).map(date => ({ date, items: groups[date] }))

  return (
    <div className="grid gap-9 max-[700px]:gap-6">
      {/* Money Summary */}
      <div className="space-y-[18px]">
        <div className="bg-teal-50/50 border border-teal-100/50 rounded-2xl p-4 max-[480px]:p-3 flex items-center gap-3">
          <MaterialIcon icon="auto_awesome" fill className="text-teal-400 shrink-0 text-lg max-[480px]:text-base" />
          <p className="text-sm max-[480px]:text-xs font-semibold text-teal-900">{tip}</p>
        </div>
        <div className="apple-card p-[25px] max-[480px]:p-5">
          <div className="flex justify-between items-center mb-5 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 opacity-70">Money Flow</span>
            <span className="px-3 py-1 bg-teal-400/10 text-teal-400 text-[10px] font-bold rounded-full">{formatPeriod(flow.periodLabel)}</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm max-[480px]:text-xs font-medium text-slate-500">Net Growth</p>
            <h2 className="text-5xl max-[480px]:text-3xl font-bold tracking-tight text-teal-400">
              {netGrowthValue(flow) >= 0 ? '+' : ''}{netGrowthValue(flow).toLocaleString()} {currencySymbol(flow)}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-8 max-[480px]:gap-4 mt-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Received</p>
              <p className="text-2xl font-bold text-teal-400">{flow.received.value}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Spent</p>
              <p className="text-2xl font-bold text-rose-500">{flow.spent.value}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Snapshot */}
      <section className="apple-card p-[22px] bg-slate-900 text-white relative overflow-hidden border-none shadow-2xl max-[480px]:p-[18px]">
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-teal-400/20 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-40 h-40 bg-teal-400/10 rounded-full blur-[50px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4 max-[480px]:flex-col max-[480px]:gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Portfolio Snapshot</p>
              <h3 className="text-4xl font-bold tracking-tight text-white max-[480px]:text-3xl">{balance.value}</h3>
            </div>
            <div className="text-right max-[480px]:text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Health Score</p>
              <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-teal-400/10 border border-teal-400/20 backdrop-blur-sm">
                <p className="text-xl font-bold text-teal-400">{score}<span className="text-xs text-teal-400/50 ml-0.5">/100</span></p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm max-[480px]:text-xs font-medium text-slate-300 pt-3.5 border-t border-white/10">
            <div className="w-7 h-7 rounded-full bg-teal-400/20 flex items-center justify-center shrink-0">
              <MaterialIcon icon="stars" fill className="text-teal-400 text-base" />
            </div>
            <span className="opacity-70">Top Performing Asset:</span>
            <span className="text-white font-bold">{topAsset}</span>
          </div>
        </div>
      </section>

      {/* Activity Score */}
      <section>
        <div className="section-label mb-[18px] flex justify-between text-sm font-[750] tracking-[-.02em] text-[var(--ink)]">
          <strong>Activity Score</strong>
        </div>
        <div className="apple-card p-[25px] max-[480px]:p-5">
          <div className="flex items-center gap-6 mb-6 max-[480px]:flex-col max-[480px]:text-center">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <circle cx="18" cy="18" fill="transparent" r="16" stroke="#F1F5F9" strokeWidth="3" />
                <circle
                  cx="18" cy="18" fill="transparent"
                  filter="drop-shadow(0 0 4px rgba(45,212,191,0.3))"
                  r="16" stroke="url(#scoreGradient)"
                  strokeDasharray={dashArray}
                  strokeLinecap="round" strokeWidth="3"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tracking-tighter">{score}</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Score</span>
              </div>
            </div>
            <div className="text-left max-[480px]:text-center">
              <h4 className="font-bold text-xl max-[480px]:text-lg tracking-tight">{scoreLabel}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{score}/{score > 0 ? 100 : 100} — {classificationDetail}</p>
            </div>
          </div>

          <div className="px-3.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.12em] mb-0.5">Strongest Factor</p>
                <p className="text-sm font-bold truncate">{strongest.label}</p>
                <p className="text-xs text-slate-500 truncate">{strongest.value}</p>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {strongest.strength}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {signals.map((signal) => (
              <div key={signal.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${signal.dotColor} shrink-0`} />
                  <span className="text-sm max-[480px]:text-xs font-medium truncate">{signal.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs max-[480px]:text-[10px] text-slate-500">{signal.value}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${signal.badgeClass}`}>
                    {signal.strength}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-[0.12em]">Opportunity</span>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{weaknessTip}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-400/10 flex items-center justify-center shrink-0">
              <MaterialIcon icon="bar_chart" className="text-teal-400 text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{benchmarkLabel}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{scoreExplanation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Money Journey */}
      <section>
        <div className="section-label mb-[18px] flex justify-between text-sm font-[750] tracking-[-.02em] text-[var(--ink)]">
          <strong>Money Journey</strong>
        </div>
        <div className="apple-card overflow-hidden">
          {groupedTransactions.length > 0 ? groupedTransactions.map((group) => (
            <div key={group.date}>
              <div className="px-[25px] pt-5 pb-2.5 max-[480px]:px-5 max-[480px]:pt-4 max-[480px]:pb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{group.date}</span>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {group.items.map((tx, i) => {
                  const config = getTxConfig(tx)
                  return (
                    <div key={tx.title} className="px-[25px] py-3.5 flex items-center gap-4 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors duration-150 max-[480px]:px-5 max-[480px]:py-3">
                      <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center shrink-0 max-[480px]:w-10 max-[480px]:h-10`}>
                        <MaterialIcon icon={config.icon} className={`${config.color} text-xl max-[480px]:text-lg`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold truncate">{tx.displayTitle}</h4>
                          <span className={`text-sm font-bold ${config.color} shrink-0`}>{tx.amount}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] text-slate-500 font-medium truncate">{tx.protocol}</span>
                            <span className="text-slate-300 dark:text-slate-600 select-none">·</span>
                            <span className="text-[11px] text-slate-400 shrink-0">{tx.meta}</span>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold ${config.bg} ${config.color}`}>
                            {config.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )) : (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                <MaterialIcon icon="receipt_long" className="text-slate-400 text-2xl" />
              </div>
              <p className="text-sm text-slate-500">No transactions found for this period.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
