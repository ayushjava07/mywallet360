import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const TOKEN_COLORS = [
  '#18c5c0', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
]

function TokenIcon({ symbol }) {
  const initial = (symbol || '?').charAt(0)
  const colorIndex = symbol ? symbol.charCodeAt(0) % TOKEN_COLORS.length : 0
  const bg = TOKEN_COLORS[colorIndex]

  return (
    <span
      className="holdings-token-icon"
      style={{ background: bg }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}

function AllocationBar({ percent }) {
  return (
    <div className="holdings-bar-track" aria-hidden="true">
      <div className="holdings-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="holdings-skeleton-row">
      <span className="holdings-skeleton-icon" />
      <div className="holdings-skeleton-lines">
        <span className="holdings-skeleton-line holdings-skeleton-line--short" />
        <span className="holdings-skeleton-line holdings-skeleton-line--long" />
      </div>
      <div className="holdings-skeleton-lines holdings-skeleton-lines--right">
        <span className="holdings-skeleton-line holdings-skeleton-line--medium" />
        <span className="holdings-skeleton-line holdings-skeleton-line--short" />
      </div>
      <span className="holdings-skeleton-bar" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="holdings-empty">
      <div className="holdings-empty-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 18V6" />
        </svg>
      </div>
      <strong>No assets found</strong>
      <span>No priced assets were discovered for this wallet in the selected period.</span>
    </div>
  )
}

export function PortfolioHoldings({ holdings, isLoading }) {
  const sorted = useMemo(() => {
    if (!holdings || holdings.length === 0) return []
    return [...holdings].sort((a, b) => {
      const aVal = parseFloat(String(a.usdValue).replace(/[^0-9.-]/g, ''))
      const bVal = parseFloat(String(b.usdValue).replace(/[^0-9.-]/g, ''))
      return bVal - aVal
    })
  }, [holdings])

  const donutData = useMemo(() => {
    return sorted.slice(0, 8).map((h, i) => ({
      name: h.symbol,
      value: parseFloat(String(h.usdValue).replace(/[^0-9.-]/g, '')) || 0,
      fill: TOKEN_COLORS[i % TOKEN_COLORS.length],
    }))
  }, [sorted])

  if (isLoading) {
    return (
      <section className="card holdings-card">
        <div className="holdings-header">
          <div className="holdings-header-left">
            <h2>Your Assets</h2>
          </div>
        </div>
        <div className="holdings-list">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </section>
    )
  }

  return (
    <section className="card holdings-card">
      <div className="holdings-header">
        <div className="holdings-header-left">
          <h2>Your Assets</h2>
          {sorted.length > 0 && <span className="holdings-count">{sorted.length}</span>}
        </div>
      </div>
      {sorted.length === 0 ? <EmptyState /> : (
        <div className="holdings-layout">
          <div className="holdings-list">
            {sorted.map((asset) => (
              <div className="holdings-row" key={`${asset.contractAddress || 'eth'}-${asset.symbol}`}>
                <TokenIcon symbol={asset.symbol} />
                <div className="holdings-row-info">
                  <strong>{asset.symbol}</strong>
                  <span>{asset.balance}</span>
                </div>
                <div className="holdings-row-values">
                  <strong>{asset.usdValue}</strong>
                  <span>{asset.percentage}%</span>
                </div>
                <AllocationBar percent={asset.percentage} />
              </div>
            ))}
          </div>
          {donutData.length > 0 && (
            <div className="holdings-donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="holdings-donut-center">
                <strong>${sorted.reduce((sum, a) => {
                  const v = parseFloat(String(a.usdValue).replace(/[^0-9.-]/g, ''))
                  return sum + (isNaN(v) ? 0 : v)
                }, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                <span>Total Value</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
