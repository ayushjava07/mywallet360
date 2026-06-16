import { navItems } from '../../config/dashboard'
import { Icon } from '../common/Icon'

export function BottomNav({ active = 'Overview', onChange }) {
  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-10 grid w-full grid-cols-4 border-t border-white/95 bg-white/80 px-4 pt-[7px] pb-[max(7px,env(safe-area-inset-bottom))] shadow-[0_-1px_0_rgba(44,122,123,.07),0_-12px_30px_rgba(44,122,123,.12),0_-28px_62px_rgba(44,122,123,.07)] backdrop-blur-[30px] backdrop-saturate-[145%] dark:border-[var(--border)] dark:bg-[rgba(17,24,39,.76)] dark:shadow-[0_-1px_0_var(--border),0_-18px_48px_rgba(0,0,0,.34)] max-[480px]:px-1.5 max-[480px]:pt-[7px] max-[480px]:pb-[max(7px,env(safe-area-inset-bottom))] max-[360px]:pt-1.5 max-[360px]:pb-[max(6px,env(safe-area-inset-bottom))]">
      {navItems.map((item) => (
        <button
          className={`grid min-h-12 cursor-pointer content-center justify-items-center gap-0.5 border-0 bg-transparent text-[11px] font-bold text-[var(--muted)] max-[700px]:min-h-[54px] max-[700px]:text-[10px] max-[480px]:text-[6px] max-[360px]:min-h-[46px] ${active === item.label ? 'active text-[var(--ink)]' : ''}`}
          type="button"
          onClick={() => onChange?.(item.label)}
          key={item.label}
        >
          <span className="grid size-10 place-items-center rounded-full transition-all max-[700px]:size-[38px] max-[360px]:size-8"><Icon name={item.icon} alt="" /></span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
