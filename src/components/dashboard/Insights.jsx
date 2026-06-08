import { Icon } from '../common/Icon'

export function Insights({ insights }) {
  return (
    <section className="insights-grid">
      {insights.map((insight, index) => (
        <article className="card insight-card" key={insight.label}>
          <span className={`icon-box ${index === 0 ? 'teal' : 'blue'}`}>
            <Icon name={index === 0 ? '99_959.svg' : '99_969.svg'} alt="" />
          </span>
          <span>{insight.label}</span>
          <strong>
            {insight.suffix === 'USD' && <small>$</small>} {insight.value}{' '}
            {insight.suffix !== 'USD' && <small>{insight.suffix}</small>}
          </strong>
        </article>
      ))}
    </section>
  )
}
