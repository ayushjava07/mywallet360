import { createElement, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calculator, CheckCircle2, Info, X } from 'lucide-react'

const OPEN_EVENT = 'metric-explainer:open'

export function MetricExplainer({
  as = 'article',
  className = '',
  explanation,
  children,
  ...props
}) {
  const panelId = useId()
  const titleId = useId()
  const triggerRef = useRef(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)
  const [position, setPosition] = useState(null)
  const isOpen = Boolean(position)

  const open = () => {
    const rect = triggerRef.current.getBoundingClientRect()
    const mobile = window.innerWidth <= 700
    const width = Math.min(320, window.innerWidth - 24)
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12)
    const fitsBelow = rect.bottom + 230 < window.innerHeight

    setPosition({
      left,
      top: fitsBelow ? rect.bottom + 10 : Math.max(12, rect.top - 10),
      width,
      placement: fitsBelow ? 'below' : 'above',
      mode: mobile ? 'sheet' : 'popover',
    })
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: panelId }))
  }

  const close = (restoreFocus = false) => {
    setPosition(null)
    if (restoreFocus) requestAnimationFrame(() => buttonRef.current?.focus())
  }
  const toggle = () => isOpen ? close() : open()

  useEffect(() => {
    if (!explanation) return undefined

    const closeOther = (event) => {
      if (event.detail !== panelId) close()
    }
    const closeOutside = (event) => {
      if (!triggerRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) close()
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') close(true)
    }

    window.addEventListener(OPEN_EVENT, closeOther)
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', close)
    const closeOnDesktopScroll = () => {
      if (window.innerWidth > 700) close()
    }
    window.addEventListener('scroll', closeOnDesktopScroll, true)

    return () => {
      window.removeEventListener(OPEN_EVENT, closeOther)
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', closeOnDesktopScroll, true)
    }
  }, [explanation, panelId])

  useEffect(() => {
    if (!explanation || position?.mode !== 'sheet') return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [explanation, position?.mode])

  if (!explanation) return createElement(as, { className, ...props }, children)

  const trigger = createElement(as, {
    className: `${className} metric-explainer${isOpen ? ' metric-explainer--open' : ''}`,
    ref: triggerRef,
    ...props,
  }, children, (
    <button
      className="metric-explainer__hint"
      type="button"
      ref={buttonRef}
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-label={`Explain ${explanation.title}`}
      onClick={toggle}
    >
      <Info aria-hidden="true" /><small>Why?</small>
    </button>
  ))

  return (
    <>
      {trigger}
      {position && createPortal(
        <>
          <button className="metric-explanation__backdrop" type="button" aria-label="Close explanation" onClick={() => close(true)} />
          <aside
            className={`metric-explanation metric-explanation--${position.placement} metric-explanation--${position.mode}`}
            id={panelId}
            ref={panelRef}
            role="dialog"
            aria-modal={position.mode === 'sheet' ? 'true' : undefined}
            aria-labelledby={titleId}
            style={position.mode === 'popover' ? { left: position.left, top: position.top, width: position.width } : undefined}
          >
            <span className="metric-explanation__handle" aria-hidden="true" />
            <div className="metric-explanation__heading">
              <span><Info aria-hidden="true" /></span>
              <div><small>Data explanation</small><strong id={titleId}>{explanation.title}</strong></div>
              <button type="button" aria-label="Close details" onClick={() => close(true)}><X aria-hidden="true" /></button>
            </div>
            <p className="metric-explanation__summary">{explanation.summary}</p>
            {explanation.formula && (
              <section className="metric-explanation__section">
                <span><Calculator aria-hidden="true" /> How it is calculated</span>
                <code>{explanation.formula}</code>
              </section>
            )}
            {explanation.details?.length > 0 && (
              <section className="metric-explanation__section">
                <span><CheckCircle2 aria-hidden="true" /> Evidence from this wallet</span>
                <ul>
                  {explanation.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              </section>
            )}
            <button className="metric-explanation__done" type="button" onClick={() => close(true)}>Got it</button>
          </aside>
        </>,
        document.body,
      )}
    </>
  )
}
