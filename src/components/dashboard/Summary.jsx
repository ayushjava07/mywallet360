import { Icon } from '../common/Icon'
import { SectionLabel } from '../common/SectionLabel'

function FlowCard({ direction, data }) {
  const incoming = direction === 'in'

  return (
    <article className={`card flow-card flow-card--${incoming ? 'received' : 'spent'} relative min-h-[184px] overflow-hidden p-[25px] max-[700px]:min-h-[172px] max-[700px]:p-5 max-[360px]:p-3.5`}>
      <div className="flow-card__top flex justify-between gap-2.5">
        <span className={`icon-box ${incoming ? 'green' : 'red'}`}>
          <Icon name={incoming ? '99_740.svg' : '99_756.svg'} alt="" />
        </span>
        <div className="grid justify-items-end gap-[5px]">
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
    <section className="summary relative min-[900px]:px-0.5">
      <SectionLabel>Summary</SectionLabel>
      <div className="summary__heading mt-2 mb-[22px] flex items-end justify-between gap-4 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-1">
        <div><h2>{flow.periodLabel}</h2><span>Wallet Money Flow Report</span></div>
        <span>Where did my money go?</span>
      </div>
      <div className="flow-grid relative grid grid-cols-2 gap-[18px] max-[700px]:grid-cols-1">
        <FlowCard direction="in" data={flow.received} />
        <FlowCard direction="out" data={flow.spent} />
      </div>
      <div className="breakdown-section">
        <div className="breakdown-section__heading mb-3 flex items-baseline justify-between gap-3">
          <strong>Transaction Breakdown</strong>
          <span>By category</span>
        </div>
        <div className="category-grid grid grid-cols-4 gap-2.5 max-[899px]:grid-cols-2 max-[480px]:grid-cols-1">
          {flow.categories.map((category) => (
            <article className={`card category-card category-card--${category.tone} relative grid min-h-[102px] gap-[11px] overflow-hidden rounded-[18px] border-0 p-[14px] max-[700px]:gap-3.5 max-[700px]:p-[13px] max-[480px]:min-h-[78px]`} key={category.label}>
              <div className="flex items-center justify-start gap-[9px]">
                <span className={`icon-box icon-box--small ${category.tone}`}>
                  <Icon name={category.icon} alt="" size="sm" />
                </span>
                <strong>{category.label}</strong>
              </div>
              <div className="flex items-center justify-between gap-[9px]"><strong>{category.value}</strong><span>{category.percent}%</span></div>
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
