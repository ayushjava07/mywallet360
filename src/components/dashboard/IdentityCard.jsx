import identificationCard3d from '@iconify-icons/fluent-emoji/identification-card'
import { identityIcons } from '../../config/dashboard'
import { ThreeDIcon } from '../common/Icon'

export function IdentityCard({ stats }) {
  return (
    <section className="card identity-card relative isolate overflow-hidden rounded-[28px] border-0 p-7 shadow-[0_18px_48px_rgba(20,65,66,.075)] min-[900px]:col-span-full max-[700px]:p-[22px] max-[480px]:p-[18px] max-[360px]:p-3.5">
      <div className="card-heading relative z-[1] flex items-center justify-between gap-4 max-[480px]:items-start">
        <div className="title-with-icon flex min-w-0 items-center gap-2.5 max-[480px]:gap-[7px]">
          <span className="icon-box icon-box--3d"><ThreeDIcon icon={identificationCard3d} /></span>
          <h2>Financial Identity Profile</h2>
        </div>
        <span className="pill pill--verified">Verified</span>
      </div>
      <div className="identity-grid relative z-[1] mt-[22px] grid grid-cols-2 gap-3 max-[700px]:mt-[18px] max-[700px]:gap-2.5 max-[480px]:grid-cols-1 max-[480px]:gap-[9px]">
        {stats.map((stat) => (
          <article className={`stat stat--${stat.tone} relative grid min-h-[126px] min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border-0 p-5 max-[480px]:min-h-28 max-[480px]:p-4`} key={stat.label}>
            <span className="stat__icon stat__icon--3d"><ThreeDIcon icon={identityIcons[stat.icon]} /></span>
            <div className="stat__content grid min-w-0 gap-[5px]">
              <span className="stat__name">{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.description}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
