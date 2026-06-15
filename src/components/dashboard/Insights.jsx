import { Icon } from '../common/Icon'
import { MetricExplainer } from '../common/MetricExplainer'

export function Insights({ insights }) {
  return (
    <section className="insights-grid grid grid-cols-2 gap-[18px] max-[480px]:gap-2.5">
      {insights.map((insight, index) => (
        <MetricExplainer
          as="article"
          className="card insight-card grid gap-2.5 border-0 bg-white/80 p-5 shadow-[0_12px_30px_rgba(44,122,123,.045)] dark:bg-[rgba(22,27,34,.94)] dark:shadow-[0_18px_46px_rgba(0,0,0,.26)] max-[480px]:p-[15px]"
          explanation={insight.explanation}
          key={insight.label}
        >
          <span className={`icon-box ${index === 0 ? 'teal' : 'blue'}`}>
            <Icon name={index === 0 ? '99_959.svg' : '99_969.svg'} alt="" />
          </span>
          <span>{insight.label}</span>
          <strong>{insight.value} <small>{insight.suffix}</small></strong>
        </MetricExplainer>
      ))}
    </section>
  )
}
