import { useState } from 'react'
import { highlightIcons } from '../../config/dashboard'
import { Icon } from '../common/Icon'

function Transaction({ item }) {
  return (
    <article className={`transaction transaction--${item.tone} relative grid min-w-0 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto_minmax(72px,auto)] items-center gap-[11px] rounded-[14px] border-0 bg-transparent p-[13px_11px] max-[1050px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[700px]:grid-cols-[auto_minmax(0,1fr)] max-[480px]:gap-[9px] max-[480px]:p-[9px_7px] max-[360px]:grid-cols-[auto_minmax(0,1fr)]`} tabIndex="0">
      <div className="transaction__visual">
        <span className={`icon-box ${item.tone}`}><Icon name={item.icon} alt="" /></span>
        <span className={`protocol-logo protocol-logo--${item.tone}`} title={item.protocol}>
          {item.protocolMark}
        </span>
      </div>
      <div className="transaction__main grid min-w-0 gap-1">
        <strong>{item.displayTitle}</strong>
        <div className="transaction__context">
          <span className="transaction__protocol">{item.protocol}</span>
          <span aria-hidden="true">•</span>
          <span className="chain-badge">{item.chain}</span>
        </div>
      </div>
      <div className="transaction__amount">
        <strong className={item.positive ? 'positive' : ''}>{item.amount}</strong>
        <span>{item.crypto}</span>
      </div>
      <span className="transaction__time">{item.meta}</span>
    </article>
  )
}

function Highlight({ highlight }) {
  const HighlightIcon = highlightIcons[highlight.icon]

  return (
    <article className={`highlight-item highlight-item--${highlight.tone} grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-[15px] p-[11px]`}>
      <span className="highlight-item__icon"><HighlightIcon aria-hidden="true" /></span>
      <div className="grid min-w-0 gap-[3px]">
        <span>{highlight.label}</span>
        <strong>{highlight.value} <small>• {highlight.detail}</small></strong>
      </div>
    </article>
  )
}

export function Activity({ transactions, highlights }) {
  const [showAll, setShowAll] = useState(false)
  const visibleTransactions = showAll ? transactions : transactions.slice(0, 3)

  return (
    <section className="activity min-[900px]:px-0.5">
      <div className="activity-layout grid grid-cols-[minmax(0,1.65fr)_minmax(300px,.9fr)] items-stretch gap-[18px] max-[1050px]:grid-cols-[minmax(0,1.35fr)_minmax(270px,.85fr)] max-[1050px]:gap-[14px] max-[899px]:grid-cols-1">
        <div className="card activity-feed rounded-3xl border-0 p-[22px] max-[1050px]:p-[18px] max-[480px]:rounded-[20px] max-[480px]:p-3.5">
          <div className="activity-card__heading flex min-h-[35px] items-center justify-between gap-4">
            <div className="grid gap-[3px]"><span>Wallet timeline</span><h2>Recent Activity</h2></div>
            <button type="button" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Show Less' : 'See All'}
            </button>
          </div>
          <div className="transaction-list mt-3 grid grid-cols-1 gap-[3px]">
            {visibleTransactions.map((item) => <Transaction item={item} key={item.title} />)}
          </div>
        </div>

        <aside className="card highlights-card rounded-3xl border-0 p-[22px] max-[1050px]:p-[18px] max-[480px]:rounded-[20px] max-[480px]:p-3.5">
          <div className="activity-card__heading flex min-h-[35px] items-center justify-between gap-4">
            <div className="grid gap-[3px]"><span>Wallet intelligence</span><h2>Key Highlights</h2></div>
          </div>
          <div className="highlights-list mt-3 grid gap-[7px] max-[899px]:grid-cols-2 max-[480px]:grid-cols-1">
            {highlights.map((highlight) => <Highlight highlight={highlight} key={highlight.label} />)}
          </div>
        </aside>
      </div>
    </section>
  )
}
