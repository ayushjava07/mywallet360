import { Sparkles } from 'lucide-react'
import { portfolioIcons } from '../../config/dashboard'

export function PortfolioCard({ portfolio }) {
  return (
    <section className="card portfolio-card relative rounded-[28px] border-0 p-8 shadow-[0_20px_50px_rgba(23,70,71,.09)] dark:shadow-[0_20px_50px_rgba(0,0,0,.28)] max-[700px]:p-[18px] max-[360px]:p-3.5">
      <div className="portfolio-card__heading mb-[22px] flex items-center justify-between gap-[18px]">
        <div className="grid gap-[5px]"><span>Wallet intelligence</span><h2>Portfolio Snapshot</h2></div>
        <span className="portfolio-status"><i /> {portfolio.status}</span>
      </div>
      <div className="portfolio-grid mb-[14px] grid grid-cols-2 gap-2.5 max-[700px]:grid-cols-1 max-[360px]:grid-cols-1">
        {portfolio.metrics.map((metric) => {
          const MetricIcon = portfolioIcons[metric.icon]

          return (
            <article
              className={`portfolio-metric relative grid min-h-28 min-w-0 grid-cols-[minmax(0,1fr)_auto] content-end gap-[5px] rounded-[18px] p-[14px] max-[700px]:min-h-28${metric.primary ? ' portfolio-metric--primary' : ''}`}
              key={metric.label}
            >
              <span className="portfolio-metric__icon"><MetricIcon aria-hidden="true" /></span>
              <span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small>
            </article>
          )
        })}
      </div>
      <div className="score-bar relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-[11px] gap-y-2.5 rounded-[18px] p-[15px]">
        <span className="score-bar__icon"><Sparkles aria-hidden="true" /></span>
        <div className="score-bar__copy"><span>Portfolio Score</span><strong>Excellent</strong></div>
        <strong className="score-bar__value">{portfolio.score}<small>/100</small></strong>
        <div className="score-bar__meter" aria-hidden="true"><i style={{ width: `${portfolio.score}%` }} /></div>
      </div>
    </section>
  )
}
