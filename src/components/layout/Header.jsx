import { useEffect, useRef, useState } from 'react'
import { Bell, BellRing, CheckCircle2, ChevronDown, Moon, Search, Sun, WalletCards, X } from 'lucide-react'

const compactAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`

export function Header({
  wallet,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchError,
  onSelectExampleWallet,
  isLoading,
  exampleWallets,
  theme,
  onToggleTheme,
}) {
  const searchInputRef = useRef(null)
  const notificationRef = useRef(null)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(() => (
    'Notification' in window ? Notification.permission : 'unsupported'
  ))

  useEffect(() => {
    const handleSearchShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }

      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        onSearchChange('')
        searchInputRef.current.blur()
      }

      if (event.key === 'Escape') {
        setIsNotificationPanelOpen(false)
      }
    }

    const handleOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setIsNotificationPanelOpen(false)
      }
    }

    window.addEventListener('keydown', handleSearchShortcut)
    document.addEventListener('pointerdown', handleOutsideClick)

    return () => {
      window.removeEventListener('keydown', handleSearchShortcut)
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [onSearchChange])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === 'granted') {
        try {
          new Notification('Notifications enabled', {
            body: 'MyWallet360 can now send browser notifications.',
            icon: '/favicon.svg',
          })
        } catch {
          // Some mobile browsers grant permission but require a service worker to display notifications.
        }
      }
    } catch {
      setNotificationPermission('unsupported')
    }
  }

  const notificationContent = {
    default: {
      title: 'Enable notifications?',
      description: 'Allow MyWallet360 to send browser notifications. You will receive a confirmation after enabling.',
    },
    granted: {
      title: 'Notifications are enabled',
      description: 'MyWallet360 has permission to send browser notifications.',
    },
    denied: {
      title: 'Notifications are blocked',
      description: 'Enable notifications from your browser site settings to receive alerts.',
    },
    unsupported: {
      title: 'Notifications unavailable',
      description: 'This browser does not support desktop notifications.',
    },
  }[notificationPermission]

  return (
    <header className="header">
      <div className="profile header__profile">
        <div className="profile__image-wrap">
          <span className="profile__placeholder profile__placeholder--brand">
            <img src="/images/Vector.svg" alt="MyWallet360 logo" />
          </span>
          {wallet && <span className="profile__status" aria-label="Wallet loaded" />}
        </div>
        <div className="profile__brand-copy">
          <h1>MyWallet360</h1>
          <span className="profile__tagline">Understands every txn.</span>
        </div>
      </div>

      <div className="wallet-search-area">
        <form className="global-search" onSubmit={(event) => {
          event.preventDefault()
          onSearchSubmit()
        }}>
          <Search aria-hidden="true" />
          <input
            ref={searchInputRef}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            type="search"
            placeholder="Enter Ethereum wallet address..."
            aria-label="Ethereum wallet address"
          />
          <button disabled={isLoading} type="submit">Analyze</button>
        </form>
        {searchError && <span className="wallet-search-error" role="alert">{searchError}</span>}
        <div className="example-wallets">
          <span>Try an example</span>
          <div>
            {exampleWallets.map((exampleWallet) => {
              const previewId = `wallet-preview-${exampleWallet.address.slice(-4)}`

              return (
                <div className="example-wallet" key={exampleWallet.address}>
                  <button
                    className={wallet?.id === exampleWallet.address ? 'active' : ''}
                    disabled={isLoading}
                    type="button"
                    onClick={() => onSelectExampleWallet(exampleWallet.address)}
                    aria-label={`Analyze ${exampleWallet.name}, ${exampleWallet.address}`}
                    aria-describedby={previewId}
                  >
                    {compactAddress(exampleWallet.address)}
                  </button>
                  <aside className="example-wallet-preview" id={previewId} role="tooltip">
                    <div className="example-wallet-preview__heading">
                      <span><WalletCards aria-hidden="true" /></span>
                      <div>
                        <small>{exampleWallet.type}</small>
                        <strong>{exampleWallet.name}</strong>
                      </div>
                    </div>
                    <p>{exampleWallet.description}</p>
                    <code>{exampleWallet.address}</code>
                    <div className="example-wallet-preview__details">
                      <small>Analyze to view</small>
                      <span>Balance</span>
                      <span>Portfolio</span>
                      <span>Activity</span>
                    </div>
                  </aside>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="header__actions">
        <div className="notification-control" ref={notificationRef}>
          <button
            className={`icon-button${isNotificationPanelOpen ? ' active' : ''}`}
            type="button"
            aria-label="Notification settings"
            aria-expanded={isNotificationPanelOpen}
            aria-controls="notification-permission-panel"
            onClick={() => setIsNotificationPanelOpen((value) => !value)}
          >
            <Bell aria-hidden="true" />
            {notificationPermission !== 'granted' && <span className="notification-dot" />}
          </button>
          {isNotificationPanelOpen && (
            <aside
              className="notification-panel"
              id="notification-permission-panel"
              role="dialog"
              aria-labelledby="notification-panel-title"
            >
              <div className={`notification-panel__icon notification-panel__icon--${notificationPermission}`}>
                {notificationPermission === 'granted'
                  ? <CheckCircle2 aria-hidden="true" />
                  : <BellRing aria-hidden="true" />}
              </div>
              <div className="notification-panel__copy">
                <strong id="notification-panel-title">{notificationContent.title}</strong>
                <p>{notificationContent.description}</p>
              </div>
              <button
                className="notification-panel__close"
                type="button"
                aria-label="Close notification settings"
                onClick={() => setIsNotificationPanelOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
              {notificationPermission === 'default' && (
                <div className="notification-panel__actions">
                  <button type="button" onClick={requestNotificationPermission}>Allow notifications</button>
                  <button type="button" onClick={() => setIsNotificationPanelOpen(false)}>Not now</button>
                </div>
              )}
            </aside>
          )}
        </div>
        <button
          className="icon-button theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-pressed={theme === 'dark'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>
        <button className="wallet-pill" type="button" aria-label={wallet ? `Connected wallet ${wallet.profile.wallet}` : 'No wallet loaded'}>
          <span className="wallet-pill__dot" />
          <span className="wallet-pill__copy">
            <strong>{wallet ? 'Connected' : 'No wallet'}</strong>
            <small>{wallet ? wallet.profile.wallet : 'Enter address'}</small>
          </span>
          <ChevronDown aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
