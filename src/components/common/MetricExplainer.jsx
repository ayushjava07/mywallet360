import { createElement, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Info, X } from 'lucide-react'

const OPEN_EVENT = 'metric-explainer:open'

export function MetricExplainer({
  as = 'article',
  className = '',
  explanation,
  children,
  ...props
}) {
  const panelId = useId()
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const [position, setPosition] = useState(null)
  const isOpen = Boolean(position)

  const open = () => {
    const rect = triggerRef.current.getBoundingClientRect()
    const width = Math.min(320, window.innerWidth - 24)
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12)
    const fitsBelow = rect.bottom + 230 < window.innerHeight

    setPosition({
      left,
      top: fitsBelow ? rect.bottom + 10 : Math.max(12, rect.top - 10),
      width,
      placement: fitsBelow ? 'below' : 'above',
    })
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: panelId }))
  }

  const close = () => setPosition(null)
  const toggle = () => isOpen ? close() : open()

  useEffect(() => {
    const closeOther = (event) => {
      if (event.detail !== panelId) close()
    }
    const closeOutside = (event) => {
      if (!triggerRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) close()
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener(OPEN_EVENT, closeOther)
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)

    return () => {
      window.removeEventListener(OPEN_EVENT, closeOther)
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [panelId])

  if (!explanation) return createElement(as, { className, ...props }, children)

  const trigger = createElement(as, {
    className: `${className} metric-explainer${isOpen ? ' metric-explainer--open' : ''}`,
    ref: triggerRef,
    role: 'button',
    tabIndex: '0',
    'aria-expanded': isOpen,
    'aria-controls': panelId,
    onClick: toggle,
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggle()
      }
    },
    ...props,
  }, children, <span className="metric-explainer__hint"><Info aria-hidden="true" /><small>Details</small></span>)

  return (
    <>
      {trigger}
      {position && createPortal(
        <aside
          className={`metric-explanation metric-explanation--${position.placement}`}
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label={explanation.title}
          style={{ left: position.left, top: position.top, width: position.width }}
        >
          <div className="metric-explanation__heading">
            <span><Info aria-hidden="true" /></span>
            <strong>{explanation.title}</strong>
            <button type="button" aria-label="Close details" onClick={close}><X aria-hidden="true" /></button>
          </div>
          <p>{explanation.summary}</p>
          {explanation.formula && <code>{explanation.formula}</code>}
          {explanation.details?.length > 0 && (
            <ul>
              {explanation.details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
          )}
        </aside>,
        document.body,
      )}
    </>
  )
}
