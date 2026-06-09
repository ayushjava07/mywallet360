import { Icon } from '../common/Icon'
import { MetricExplainer } from '../common/MetricExplainer'

export function WalletPersonality({ personality }) {
  const primaryTrait = personality.traits[0]
  const secondaryEnd = primaryTrait.value + personality.traits[1].value
  const orbitStyle = {
    background: `conic-gradient(var(--primary) 0 ${primaryTrait.value}%, var(--secondary) ${primaryTrait.value}% ${secondaryEnd}%, var(--accent) ${secondaryEnd}% 100%)`,
  }

  return (
    <section className="card personality-card relative grid grid-cols-[minmax(280px,1fr)_minmax(0,1.35fr)] gap-6 overflow-hidden p-[22px] min-[900px]:col-span-full max-[700px]:grid-cols-[minmax(230px,1fr)_minmax(0,1.2fr)] max-[700px]:gap-[18px] max-[700px]:p-[18px] max-[480px]:grid-cols-1 max-[480px]:gap-4 max-[360px]:p-3.5">
      <div className="personality-card__intro relative grid content-center pr-3 max-[480px]:pr-0">
        <span className="personality-card__eyebrow">Wallet Personality</span>
        <div className="personality-card__title mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[18px] max-[480px]:gap-3">
          <div>
            <h2>{personality.title}</h2>
            <p>{personality.description}</p>
          </div>
          <div
            className="personality-orbit"
            style={orbitStyle}
            aria-label={`${primaryTrait.label} ${primaryTrait.value}%`}
          >
            <div><strong>{primaryTrait.value}%</strong><span>Primary trait</span></div>
          </div>
        </div>
      </div>
      <div className="personality-list grid content-center gap-2.5">
        {personality.traits.map((trait) => (
          <MetricExplainer className={`personality-item personality-item--${trait.tone} flex min-w-0 items-center gap-[13px] rounded-2xl border-0 p-[14px]`} explanation={trait.explanation} key={trait.label}>
            <span className="personality-item__icon"><Icon name={trait.icon} alt="" /></span>
            <div className="personality-item__body grid min-w-0 flex-1 gap-[7px]">
              <div className="personality-item__heading flex items-center justify-between gap-2.5">
                <strong>{trait.label}</strong>
                <span>{trait.value}%</span>
              </div>
              <div className="personality-meter" aria-hidden="true">
                <i style={{ width: `${trait.value}%` }} />
              </div>
            </div>
          </MetricExplainer>
        ))}
      </div>
    </section>
  )
}
