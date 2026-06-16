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

export function MoneyFlowTab({ wallet }) {
  const { balance, flow, portfolio, transactions, insights } = wallet
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

  const txnRaw = parseInt(String(totalTxns).replace(/[^0-9.]/g, '')) || 0
  const volRaw = parseFloat(balance.value.replace(/[^0-9.]/g, '')) || 0
  const actRaw = portfolioMetrics.length
  const txnNorm = Math.min(100, txnRaw * 1.5) || 15
  const volNorm = Math.min(100, volRaw / 1200) || 15
  const actNorm = Math.min(100, actRaw * 12) || 15
  const sumNorm = txnNorm + volNorm + actNorm
  const txnPct = Math.round((txnNorm / sumNorm) * 100)
  const volPct = Math.round((volNorm / sumNorm) * 100)
  const actPct = Math.max(0, 100 - txnPct - volPct)

  const breakdownItems = [
    {
      label: 'Transactions',
      value: totalTxns,
      pct: txnPct,
      color: 'bg-teal-400',
      bar: 'bg-gradient-to-r from-teal-400 to-emerald-400',
      trend: txnRaw > 50 ? 'up' : txnRaw > 15 ? 'stable' : 'down',
      detail: `${txnRaw} on-chain transactions this period`,
    },
    {
      label: 'Volume',
      value: balance.value,
      pct: volPct,
      color: 'bg-emerald-500',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      trend: volRaw > 50000 ? 'up' : volRaw > 10000 ? 'stable' : 'down',
      detail: `${balance.value} total volume moved`,
    },
    {
      label: 'Active Metrics',
      value: `${actRaw}`,
      pct: actPct,
      color: 'bg-teal-500',
      bar: 'bg-gradient-to-r from-teal-500 to-cyan-400',
      trend: actRaw > 5 ? 'up' : actRaw > 2 ? 'stable' : 'down',
      detail: `${actRaw} active portfolio positions tracked`,
    },
  ]

  const trendIcon = { up: 'trending_up', stable: 'trending_flat', down: 'trending_down' }
  const trendColor = { up: 'text-emerald-500', stable: 'text-amber-500', down: 'text-rose-500' }
  const scoreLevel = score >= 80 ? 'Very High' : score >= 60 ? 'High' : score >= 40 ? 'Moderate' : score >= 20 ? 'Low' : 'Very Low'

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
      <section className="apple-card p-[25px] bg-slate-900 text-white relative overflow-hidden border-none shadow-2xl max-[480px]:p-5">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-teal-400/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6 max-[480px]:flex-col max-[480px]:gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Portfolio Snapshot</p>
              <h3 className="text-4xl font-bold tracking-tight text-white max-[480px]:text-3xl">{balance.value}</h3>
            </div>
            <div className="text-right max-[480px]:text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Health Score</p>
              <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-teal-400/10 border border-teal-400/20 backdrop-blur-sm">
                <p className="text-xl font-bold text-teal-400">{score}<span className="text-xs text-teal-400/50 ml-0.5">/100</span></p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm max-[480px]:text-xs font-medium text-slate-300 pt-5 border-t border-white/10">
            <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center shrink-0">
              <MaterialIcon icon="stars" fill className="text-teal-400 text-lg" />
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
          <div className="flex items-center gap-6 mb-7 max-[480px]:flex-col max-[480px]:text-center">
            <div className="relative w-24 h-24 shrink-0">
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
                <span className="text-3xl font-bold tracking-tighter">{score}</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Score</span>
              </div>
            </div>
            <div className="text-left max-[480px]:text-center">
              <h4 className="font-bold text-2xl max-[480px]:text-xl tracking-tight">{activityLevel}</h4>
              <p className="text-xs text-slate-500 mt-1">Weighted contribution breakdown</p>
            </div>
          </div>

          <div className="space-y-5 max-[480px]:space-y-3">
            {breakdownItems.map((item) => (
              <div key={item.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1.5 max-[480px]:gap-x-2 max-[480px]:gap-y-1">
                <span className={`w-2 h-2 max-[480px]:w-1.5 max-[480px]:h-1.5 rounded-full ${item.color} row-span-2 mt-0.5`} />
                <div className="flex items-center justify-between min-w-0">
                  <span className="text-sm max-[480px]:text-xs font-semibold truncate">{item.label}</span>
                  <MaterialIcon icon={trendIcon[item.trend]} className={`${trendColor[item.trend]} text-lg max-[480px]:text-base shrink-0 ml-2`} />
                </div>
                <div className="col-start-2 col-end-4">
                  <div className="h-3 max-[480px]:h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.bar}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
                <span className="text-xs max-[480px]:text-[10px] font-bold text-slate-500">{item.pct}%</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-400/10 flex items-center justify-center shrink-0">
              <MaterialIcon icon="info" className="text-teal-400 text-lg" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your score of <strong className="text-teal-400">{score}</strong> is classified as <strong className="text-teal-400">{scoreLevel}</strong> based on{' '}
              {breakdownItems.filter((b) => b.trend === 'up').length} of 3 contributing factors showing above-average activity.
            </p>
          </div>
        </div>
      </section>

      {/* AI Insights */}
      <section>
        <div className="section-label mb-[18px] flex justify-between text-sm font-[750] tracking-[-.02em] text-[var(--ink)]">
          <strong>AI Insights</strong>
        </div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-1">
          {insights.length > 0 ? insights.map((insight, i) => (
            <div key={insight.label}
              className={`apple-card p-6 max-[480px]:p-4 min-w-[260px] max-[480px]:min-w-[200px] flex-shrink-0 ${i === 0 ? 'bg-teal-400 border-none text-white' : ''} ${i > 0 && i % 2 === 0 ? 'border-violet-500/10' : ''}`}
            >
              <p className={`text-[10px] font-bold ${i === 0 ? 'text-white/70' : 'text-slate-500/50'} uppercase tracking-widest mb-3`}>{insight.label}</p>
              <p className="text-base font-semibold leading-snug">{insight.value} · {insight.suffix}</p>
            </div>
          )) : (
            <div className="apple-card p-6 max-[480px]:p-4 min-w-[260px] max-[480px]:min-w-[200px] flex-shrink-0 bg-teal-400 border-none text-white">
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-3">Insights</p>
              <p className="text-base font-semibold leading-snug">No insights available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Money Journey */}
      <section>
        <div className="section-label mb-[18px] flex justify-between text-sm font-[750] tracking-[-.02em] text-[var(--ink)]">
          <strong>Money Journey</strong>
        </div>
        <div className="apple-card overflow-hidden">
          <div className="px-[25px] max-[480px]:px-5">
            {transactions.length > 0 ? transactions.slice(0, 5).map((tx, i) => {
              const isPositive = tx.positive
              const isLast = i === Math.min(transactions.length, 5) - 1
              const icon = isPositive ? 'south_west' : 'north_east'
              const color = isPositive ? 'text-teal-400' : 'text-rose-500'
              const bg = isPositive ? 'bg-teal-400/10' : 'bg-rose-500/10'

              return (
                <div key={tx.title} className={`py-6 flex items-center gap-5 ${!isLast ? 'border-b border-gray-50 dark:border-white/5' : ''} transaction-row max-[480px]:gap-3 max-[480px]:py-4`}>
                  <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center shrink-0 max-[480px]:w-12 max-[480px]:h-12`}>
                    <MaterialIcon icon={icon} className={`${color} text-2xl`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-0.5">
                      <h4 className="text-[15px] font-bold truncate">{tx.displayTitle}</h4>
                      <span className={`text-[15px] font-bold ${color} max-[480px]:text-sm`}>
                        {tx.amount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-1">
                      <p className="text-xs text-slate-500 font-medium opacity-60">{tx.protocol} · {tx.meta}</p>
                      <span className={`px-2.5 py-0.5 ${isPositive ? 'bg-teal-400/10 text-teal-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} text-[9px] max-[480px]:text-[8px] font-bold rounded-full uppercase tracking-wider max-[480px]:mt-0.5`}>
                        {isPositive ? 'Completed' : 'Success'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }) : (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">No transactions found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
