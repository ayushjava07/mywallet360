import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronDown, TrendingUp } from 'lucide-react'
import { metricIcons } from '../../config/dashboard'

export function BalanceCard({ balance, periods, selectedDays, pendingDays, isLoading, error, onPeriodChange }) {
  const menuRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const selectedPeriod = periods.find((period) => period.days === selectedDays)
  const visiblePeriod = periods.find((period) => period.days === pendingDays) || selectedPeriod

  useEffect(() => {
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeMenu)
    return () => document.removeEventListener('pointerdown', closeMenu)
  }, [])

  const selectPeriod = (days) => {
    setIsMenuOpen(false)
    onPeriodChange(days)
  }

  return (
    <section className="balance-card relative isolate grid min-h-[418px] grid-rows-[1fr_auto] gap-[30px] overflow-hidden rounded-[28px] p-8 text-white max-[700px]:min-h-[390px] max-[700px]:p-6 max-[480px]:min-h-[430px] max-[480px]:gap-[18px] max-[480px]:p-[18px] max-[360px]:p-3.5">
      <span className="balance-card__glass" aria-hidden="true" />
      <div className="absolute! top-[26px] right-[26px] z-10! pointer-events-auto max-[480px]:top-[15px] max-[480px]:right-[15px]" ref={menuRef}>
        <button
          className="balance-rank-chip flex min-w-[150px] cursor-pointer items-center gap-2 rounded-2xl border-0 px-3 py-2.5 text-left text-white transition hover:bg-[rgba(3,105,103,.34)] disabled:cursor-wait disabled:opacity-70"
          type="button"
          disabled={isLoading}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <CalendarDays className="shrink-0" aria-hidden="true" />
          <span className="grid flex-1 gap-0.5">
            <strong className="text-[10px] leading-none">{visiblePeriod?.label}</strong>
            <small className="text-[7px] font-semibold text-white/65">{isLoading ? 'Updating dashboard...' : 'Activity period'}</small>
          </span>
          {isLoading
            ? <span className="size-3 animate-spin rounded-full border border-white/40 border-t-white" aria-label="Updating dashboard" />
            : <ChevronDown className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />}
        </button>
        {isMenuOpen && (
          <div className="absolute top-[calc(100%+8px)] right-0 grid w-[230px] gap-1 rounded-2xl border border-white/20 bg-[rgba(7,91,90,.96)] p-1.5 shadow-[0_18px_45px_rgba(0,60,59,.28)] backdrop-blur-xl" role="menu">
            {periods.map((period) => (
              <button
                className={`grid cursor-pointer grid-cols-[34px_1fr_auto] items-center gap-2 rounded-xl border-0 px-2.5 py-2 text-left text-white transition ${selectedDays === period.days ? 'bg-white/16' : 'bg-transparent hover:bg-white/10'}`}
                type="button"
                role="menuitemradio"
                aria-checked={selectedDays === period.days}
                onClick={() => selectPeriod(period.days)}
                key={period.days}
              >
                <span className="grid size-[30px] place-items-center rounded-lg bg-white/10 text-[9px] font-extrabold">{period.shortLabel}</span>
                <span className="grid gap-0.5">
                  <strong className="text-[10px]">{period.label}</strong>
                  <small className="text-[8px] text-white/60">{period.description}</small>
                </span>
                {selectedDays === period.days && <Check className="size-3.5" aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <span className="absolute! top-[74px] right-[26px] z-10! max-w-[230px] rounded-lg bg-red-950/70 px-2.5 py-1.5 text-right text-[9px] font-bold text-white max-[480px]:top-[60px] max-[480px]:right-[15px]">
          {error}
        </span>
      )}
      <svg className="balance-sparkline" viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sparklineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity=".55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity=".12" />
          </linearGradient>
          <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="balance-sparkline__fill"
          d="M0 190 C45 175 65 184 102 158 S160 143 196 150 S250 123 286 132 S338 104 374 112 S421 81 460 91 S522 53 600 38 L600 220 L0 220 Z"
        />
        <path
          className="balance-sparkline__line"
          d="M0 190 C45 175 65 184 102 158 S160 143 196 150 S250 123 286 132 S338 104 374 112 S421 81 460 91 S522 53 600 38"
        />
      </svg>
      <div className="balance-card__main flex min-h-[225px] flex-col items-center justify-center text-center max-[700px]:min-h-[205px]">
        <span className="eyebrow eyebrow--light">{balance.valuationLabel}</span>
        <h2>{balance.value}</h2>
        <span className="growth-pill"><TrendingUp aria-hidden="true" />{balance.rank} in {(selectedPeriod?.label || balance.growth).toLowerCase()}</span>
      </div>
      <div className="balance-stats grid grid-cols-4 gap-[9px] max-[700px]:gap-[7px] max-[480px]:grid-cols-2 max-[480px]:gap-2">
        {balance.stats.map((stat) => {
          const StatIcon = metricIcons[stat.icon]

          return (
            <div className="balance-stat grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-[3px] rounded-2xl p-[13px] max-[700px]:p-[9px] max-[480px]:p-[11px]" key={stat.label}>
              <span className="balance-stat__icon"><StatIcon aria-hidden="true" /></span>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          )
        })}
      </div>
    </section>
  )
}
