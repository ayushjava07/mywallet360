import { Icon } from '../common/Icon'

export function WalletPersonality({ personality }) {
  const primaryTrait = personality.traits[0]
  const secondaryTrait = personality.traits[1]
  const secondaryEnd = primaryTrait.value + secondaryTrait.value
  const toneVar = (tone) => `var(--tone-${tone})`
  const orbitStyle = {
    background: `conic-gradient(${toneVar(primaryTrait.tone)} 0 ${primaryTrait.value}%, ${toneVar(secondaryTrait.tone)} ${primaryTrait.value}% ${secondaryEnd}%, var(--segment-remaining) ${secondaryEnd}% 100%)`,
  }
  const orbitGlow = { '--orbit-glow': `var(--tone-${primaryTrait.tone})` }

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
            style={{ ...orbitStyle, ...orbitGlow }}
            aria-label={`${primaryTrait.label} ${primaryTrait.value}%`}
          >
            <div><strong>{primaryTrait.value}%</strong><span>{primaryTrait.label}</span></div>
          </div>
        </div>
      </div>
      <div className="personality-list grid content-center gap-2.5">
        {personality.traits.map((trait) => (
          <article className={`personality-item personality-item--${trait.tone} flex min-w-0 items-center gap-[13px] rounded-2xl border-0 p-[14px]`} key={trait.label}>
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
          </article>
        ))}
      </div>
    </section>
  )
}
