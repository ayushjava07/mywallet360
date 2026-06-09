import crystalBall3d from '@iconify-icons/fluent-emoji/crystal-ball'
import { aiIcons } from '../../config/dashboard'
import { ThreeDIcon } from '../common/Icon'

export function AIInsights({ ai }) {
  return (
    <section className="card ai-card relative grid grid-cols-[minmax(250px,.95fr)_minmax(0,1.45fr)] gap-[26px] overflow-hidden p-[26px] max-[700px]:grid-cols-[minmax(190px,.9fr)_minmax(0,1.25fr)] max-[700px]:gap-[18px] max-[700px]:p-5 max-[480px]:grid-cols-1 max-[480px]:gap-4 max-[360px]:p-3.5">
      <div className="ai-card__lead grid content-center border-r pr-6 max-[700px]:pr-[18px] max-[480px]:border-r-0 max-[480px]:border-b max-[480px]:px-0 max-[480px]:pt-0 max-[480px]:pb-4">
        <div className="ai-card__heading flex items-center gap-[11px]">
          <span className="ai-card__mark"><ThreeDIcon icon={crystalBall3d} /></span>
          <div>
            <span>AI Insights</span>
            <h2>Wallet intelligence, explained simply.</h2>
          </div>
        </div>
        <p>{ai.summary}</p>
        <span className="ai-card__confidence">{ai.confidence}</span>
      </div>
      <div className="ai-card__insights grid content-center gap-2.5">
        {ai.insights.map((insight, index) => (
          <article
            className={`ai-insight ai-insight--${insight.tone} flex min-w-0 items-center gap-3 rounded-[15px] border-0 p-[13px]${index === 0 ? ' ai-insight--highlighted p-[15px]' : ''}`}
            key={insight.text}
          >
            <span className="ai-insight__icon ai-insight__icon--3d">
              <ThreeDIcon icon={aiIcons[insight.icon]} />
            </span>
            <div><strong>{insight.text}</strong><span>{insight.detail}</span></div>
          </article>
        ))}
      </div>
    </section>
  )
}
