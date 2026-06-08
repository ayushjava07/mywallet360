import { Sparkles } from 'lucide-react'
import { portfolioIcons } from '../../config/dashboard'

export function PortfolioCard({ portfolio }) {
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
            <article
              className={`portfolio-metric${metric.primary ? ' portfolio-metric--primary' : ''}`}
              key={metric.label}
            >
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
