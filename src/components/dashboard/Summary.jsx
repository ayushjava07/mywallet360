import { Icon } from '../common/Icon'
import { SectionLabel } from '../common/SectionLabel'

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
      <div className="progress">
        <i className={incoming ? 'green' : 'red'} style={{ width: `${data.percent}%` }} />
      </div>
    </article>
  )
}

export function Summary({ flow }) {
  return (
    <section className="summary">
      <SectionLabel>Summary</SectionLabel>
      <div className="summary__heading">
        <div><h2>Last 30 Days</h2><span>Wallet Money Flow Report</span></div>
        <span>Where did my money go?</span>
      </div>
      <div className="flow-grid">
        <FlowCard direction="in" data={flow.received} />
        <FlowCard direction="out" data={flow.spent} />
      </div>
      <div className="breakdown-section">
        <div className="breakdown-section__heading">
          <strong>Spending Breakdown</strong>
          <span>By category</span>
        </div>
        <div className="category-grid">
          {flow.categories.map((category) => (
            <article className={`card category-card category-card--${category.tone}`} key={category.label}>
              <div>
                <span className={`icon-box icon-box--small ${category.tone}`}>
                  <Icon name={category.icon} alt="" size="sm" />
                </span>
                <strong>{category.label}</strong>
              </div>
              <div><strong>{category.value}</strong><span>{category.percent}%</span></div>
              <div className="category-progress" aria-hidden="true">
                <i style={{ width: `${category.percent}%` }} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
