import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp } from 'lucide-react'
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

export function BalanceCard({ balance, error, displayMode, ethPrice }) {
  const isTokens = displayMode === 'tokens'

  const displayValue = useMemo(() => {
    if (isTokens && ethPrice && balance?.netWorth !== undefined) {
      const val = balance.netWorth / ethPrice
      return `${val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ETH`
    }
    return balance?.value
  }, [balance?.value, balance?.netWorth, isTokens, ethPrice])

  const chartData = useMemo(() => {
    if (!balance?.history) return []
    if (isTokens && ethPrice) {
      return balance.history.map(point => {
        const val = point.value / ethPrice
        return {
          ...point,
          value: val,
          formattedValue: `${val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ETH`
        }
      })
    }
    return balance.history
  }, [balance?.history, isTokens, ethPrice])

  return (
    <section className="balance-card relative isolate grid min-h-[480px] grid-rows-[1fr_auto] gap-[22px] overflow-hidden rounded-[28px] p-8 text-white max-[700px]:min-h-[450px] max-[700px]:p-6 max-[480px]:min-h-[480px] max-[480px]:gap-[18px] max-[480px]:p-[18px] max-[360px]:p-3.5">
      <span className="balance-card__glass" aria-hidden="true" />
      {error && (
        <span className="absolute! top-[74px] right-[26px] z-10! max-w-[230px] rounded-lg bg-red-950/70 px-2.5 py-1.5 text-right text-[9px] font-bold text-white max-[480px]:top-[60px] max-[480px]:right-[15px]">
          {error}
        </span>
      )}
      <MetricExplainer as="div" className="balance-card__main flex min-h-[295px] flex-col items-center justify-center text-center max-[700px]:min-h-[270px]" explanation={balance.explanation}>
        <span className="eyebrow eyebrow--light">{balance.valuationLabel}</span>
        <h2>{displayValue}</h2>
        <span className="growth-pill"><TrendingUp aria-hidden="true" />{balance.rank} in {balance.growth?.toLowerCase()}</span>
        <div className="balance-chart" role="img" aria-label={`Estimated priced asset value chart for ${balance.growth}`}>
          <div className="balance-chart__heading">
            <span>Value history</span>
            <small>{isTokens ? 'ETH' : 'USD'} prices</small>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 6, bottom: 0, left: 6 }}>
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
