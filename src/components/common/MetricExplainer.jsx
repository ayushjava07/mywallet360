import { createElement, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calculator, CheckCircle2, Info, X } from 'lucide-react'

const OPEN_EVENT = 'metric-explainer:open'
const GAP = 6
const ESTIMATED_HEIGHT = 260

function pickPlacement(btnRect, vw, vh) {
  const panelWidth = Math.min(320, vw - 24)

  const fitsBelow = vh - btnRect.bottom - GAP >= ESTIMATED_HEIGHT
  const fitsAbove = btnRect.top - GAP >= ESTIMATED_HEIGHT

  let placement, top

  if (fitsBelow) {
    placement = 'below'
    top = btnRect.bottom + GAP
  } else if (fitsAbove) {
    placement = 'above'
    top = btnRect.top - GAP - ESTIMATED_HEIGHT
  } else if (vh - btnRect.bottom >= btnRect.top) {
    placement = 'below'
    top = btnRect.bottom + GAP
  } else {
    placement = 'above'
    top = Math.max(12, btnRect.top - GAP - ESTIMATED_HEIGHT)
  }

  if (placement === 'below') {
    top = Math.min(top, vh - ESTIMATED_HEIGHT - 12)
  } else {
    top = Math.max(12, top)
  }

  let left = btnRect.left + btnRect.width / 2 - panelWidth / 2
  left = Math.max(12, Math.min(left, vw - panelWidth - 12))

  const buttonCenterX = btnRect.left + btnRect.width / 2
  const arrowX = buttonCenterX - left

  return { left, top, width: panelWidth, placement, arrowX }
}

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
    const btn = buttonRef.current
    if (!btn) return

    const mobile = window.innerWidth <= 700
    if (mobile) {
      setPosition({ mode: 'sheet', placement: 'bottom' })
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: panelId }))
      return
    }

    const pos = pickPlacement(btn.getBoundingClientRect(), window.innerWidth, window.innerHeight)
    setPosition({ ...pos, mode: 'popover' })
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: panelId }))
  }

  const close = (restoreFocus = false) => {
    setPosition(null)
    if (restoreFocus) requestAnimationFrame(() => buttonRef.current?.focus())
  }
  const toggle = () => (isOpen ? close() : open())

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
      <Info aria-hidden="true" />
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
            style={position.mode === 'popover' ? {
              left: position.left,
              top: position.top,
              width: position.width,
              '--arrow-x': `${position.arrowX}px`,
            } : undefined}
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
