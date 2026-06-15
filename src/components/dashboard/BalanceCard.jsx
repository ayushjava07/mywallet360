import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronDown, TrendingUp } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { metricIcons } from '../../config/dashboard'
import { MetricExplainer } from '../common/MetricExplainer'

const formatChartDate = (date, options = {}) => new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
  ...options,
}).format(new Date(`${date}T00:00:00Z`))

function ValueTooltip({ active, payload }) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null

  return (
    <div className="balance-chart__tooltip">
      <span>{formatChartDate(point.date, { year: 'numeric' })}</span>
      <strong>{point.formattedValue}</strong>
      <small>Estimated priced assets</small>
    </div>
  )
}

export function BalanceCard({ balance, periods, selectedDays, pendingDays, isLoading, error, onPeriodChange }) {
  const menuRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const selectedPeriod = periods.find((period) => period.value === selectedDays)
  const visiblePeriod = periods.find((period) => period.value === pendingDays) || selectedPeriod

  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [])

  const selectPeriod = (days) => {
    setIsMenuOpen(false)
    onPeriodChange(days)
  }

  return (
    <section className="balance-card relative isolate grid min-h-[480px] grid-rows-[1fr_auto] gap-[22px] overflow-hidden rounded-[28px] p-8 text-white max-[700px]:min-h-[450px] max-[700px]:p-6 max-[480px]:min-h-[480px] max-[480px]:gap-[18px] max-[480px]:p-[18px] max-[360px]:p-3.5">
      <span className="balance-card__glass" aria-hidden="true" />
      <div className="absolute! top-[26px] right-[26px] z-10! pointer-events-auto max-[480px]:top-[15px] max-[480px]:right-[15px]" ref={menuRef}>
        <button
          className="balance-rank-chip flex min-w-[150px] cursor-pointer items-center gap-2 rounded-2xl border-0 px-3 py-2.5 text-left text-white transition hover:bg-[rgba(3,105,103,.34)] disabled:cursor-wait disabled:opacity-70"
          type="button"
          disabled={isLoading}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <CalendarDays className="shrink-0" aria-hidden="true" />
          <span className="grid flex-1 gap-0.5">
            <strong className="text-[10px] leading-none">{visiblePeriod?.label}</strong>
            <small className="text-[7px] font-semibold text-white/65">{isLoading ? 'Updating dashboard...' : 'Activity period'}</small>
          </span>
          {isLoading
            ? <span className="size-3 animate-spin rounded-full border border-white/40 border-t-white" aria-label="Updating dashboard" />
            : <ChevronDown className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />}
        </button>
        {isMenuOpen && (
          <div
            className="absolute right-0 grid w-[230px] gap-1 rounded-2xl border border-white/20 bg-[rgba(7,91,90,.96)] p-1.5 shadow-[0_18px_45px_rgba(0,60,59,.28)] backdrop-blur-xl"
            style={{ top: 'calc(100% + 8px)' }}
            role="menu"
          >
            {periods.map((period) => (
              <button
                className={`grid cursor-pointer grid-cols-[34px_1fr_auto] items-center gap-2 rounded-xl border-0 px-2.5 py-2 text-left text-white transition ${selectedDays === period.value ? 'bg-white/16' : 'bg-transparent hover:bg-white/10'}`}
                type="button"
                role="menuitemradio"
                aria-checked={selectedDays === period.value}
                onClick={() => selectPeriod(period.value)}
                key={period.id}
              >
                <span className="grid size-[30px] place-items-center rounded-lg bg-white/10 text-[9px] font-extrabold">{period.shortLabel}</span>
                <span className="grid gap-0.5">
                  <strong className="text-[10px]">{period.label}</strong>
                  <small className="text-[8px] text-white/60">{period.description}</small>
                </span>
                {selectedDays === period.value && <Check className="size-3.5" aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <span className="absolute! top-[74px] right-[26px] z-10! max-w-[230px] rounded-lg bg-red-950/70 px-2.5 py-1.5 text-right text-[9px] font-bold text-white max-[480px]:top-[60px] max-[480px]:right-[15px]">
          {error}
        </span>
      )}
      <MetricExplainer as="div" className="balance-card__main flex min-h-[295px] flex-col items-center justify-center text-center max-[700px]:min-h-[270px]" explanation={balance.explanation}>
        <span className="eyebrow eyebrow--light">{balance.valuationLabel}</span>
        <h2>{balance.value}</h2>
        <span className="growth-pill"><TrendingUp aria-hidden="true" />{balance.rank} in {(selectedPeriod?.label || balance.growth).toLowerCase()}</span>
        <div className="balance-chart" role="img" aria-label={`Estimated priced asset value chart for ${selectedPeriod?.label || balance.growth}`}>
          <div className="balance-chart__heading">
            <span>Value history</span>
            <small>Current prices</small>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balance.history} margin={{ top: 8, right: 6, bottom: 0, left: 6 }}>
              <defs>
                <linearGradient id="balanceChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity=".42" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity=".02" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                minTickGap={40}
                tick={{ fill: 'rgba(255,255,255,.58)', fontSize: 8, fontWeight: 700 }}
                tickFormatter={(date) => formatChartDate(date)}
              />
              <YAxis
                hide
                domain={([minimum, maximum]) => {
                  const spread = Math.max(maximum - minimum, maximum * 0.08, 1)
                  return [Math.max(0, minimum - spread), maximum + spread]
                }}
              />
              <Tooltip content={<ValueTooltip />} cursor={{ stroke: 'rgba(255,255,255,.42)', strokeDasharray: '3 3' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2.4}
                fill="url(#balanceChartFill)"
                activeDot={{ r: 4, fill: '#ffffff', stroke: '#087f80', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MetricExplainer>
      <div className="balance-stats grid grid-cols-4 gap-[9px] max-[700px]:gap-[7px] max-[480px]:grid-cols-2 max-[480px]:gap-2">
        {balance.stats.map((stat) => {
          const StatIcon = metricIcons[stat.icon]

          return (
            <MetricExplainer as="div" className="balance-stat grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-[3px] rounded-2xl p-[13px] max-[700px]:p-[9px] max-[480px]:p-[11px]" explanation={stat.explanation} key={stat.label}>
              <span className="balance-stat__icon"><StatIcon aria-hidden="true" /></span>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </MetricExplainer>
          )
        })}
      </div>
    </section>
  )
}
