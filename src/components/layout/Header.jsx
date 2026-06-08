import { useEffect, useRef, useState } from 'react'
import { Bell, BellRing, CheckCircle2, ChevronDown, Moon, Search, Sun, WalletCards, X } from 'lucide-react'

const compactAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`

export function Header({
  wallet,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchError,
  resolvedIdentifier,
  onSelectExampleWallet,
  isLoading,
  isResolving,
  exampleWallets,
  theme,
  onToggleTheme,
  connectedAddress,
  walletProviders,
  isConnecting,
  connectionError,
  onConnectWallet,
  onDisconnectWallet,
}) {
  const searchInputRef = useRef(null)
  const notificationRef = useRef(null)
  const walletControlRef = useRef(null)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [isWalletPanelOpen, setIsWalletPanelOpen] = useState(false)
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
        setIsWalletPanelOpen(false)
      }
    }

    const handleOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setIsNotificationPanelOpen(false)
      }

      if (!walletControlRef.current?.contains(event.target)) {
        setIsWalletPanelOpen(false)
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
  const hasMetaMask = walletProviders.some((walletProvider) => (
    walletProvider.provider.isMetaMask || walletProvider.rdns.includes('metamask')
  ))
  const isSearchBusy = isLoading || isResolving

  return (
    <header className="header">
      <div className="profile header__profile">
        <div className="brand-mark">
          <img src="/images/darklogo.svg" alt="" />
        </div>
        <div className="profile__brand-copy">
          <h1><span>MyWallet</span><span className="brand-360">360</span></h1>
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
            placeholder="Enter Ethereum address or ENS name..."
            aria-label="Ethereum wallet address or ENS name"
          />
          <button disabled={isSearchBusy} type="submit">
            {isResolving ? 'Resolving...' : isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
        {searchError && <span className="wallet-search-error" role="alert">{searchError}</span>}
        {resolvedIdentifier?.type === 'ens' && !searchError && (
          <div className="wallet-resolution" aria-live="polite">
            <span>ENS</span>
            <strong title={resolvedIdentifier.originalInput}>{resolvedIdentifier.originalInput}</strong>
            <span aria-hidden="true">resolves to</span>
            <code title={resolvedIdentifier.address}>{compactAddress(resolvedIdentifier.address)}</code>
          </div>
        )}
        <div className="example-wallets">
          <span>Try an example</span>
          <div>
            {exampleWallets.map((exampleWallet) => {
              const previewId = `wallet-preview-${exampleWallet.address.slice(-4)}`

              return (
                <div className="example-wallet" key={exampleWallet.address}>
                  <button
                    className={wallet?.id === exampleWallet.address ? 'active' : ''}
                    disabled={isSearchBusy}
                    type="button"
                    onClick={() => onSelectExampleWallet(exampleWallet.address)}
                    aria-label={`Analyze ${exampleWallet.name}, ${exampleWallet.address}`}
                    aria-describedby={wallet ? undefined : previewId}
                  >
                    {compactAddress(exampleWallet.address)}
                  </button>
                  {!wallet && (
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
                  )}
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
        <div className="wallet-control" ref={walletControlRef}>
          <button
            className={`wallet-pill${connectedAddress ? ' connected' : ''}`}
            type="button"
            aria-label={connectedAddress ? `Connected wallet ${connectedAddress}` : 'Connect wallet'}
            aria-expanded={isWalletPanelOpen}
            aria-controls="wallet-connection-panel"
            onClick={() => setIsWalletPanelOpen((value) => !value)}
          >
            <span className="wallet-pill__dot" />
            <span className="wallet-pill__copy">
              <strong>{connectedAddress ? 'Connected wallet' : 'Connect wallet'}</strong>
              <small>{connectedAddress ? compactAddress(connectedAddress) : 'MetaMask or browser wallet'}</small>
            </span>
            <ChevronDown aria-hidden="true" />
          </button>
          {isWalletPanelOpen && (
            <aside
              className="wallet-connect-panel"
              id="wallet-connection-panel"
              role="dialog"
              aria-labelledby="wallet-connect-title"
            >
              <div className="wallet-connect-panel__heading">
                <span><WalletCards aria-hidden="true" /></span>
                <div>
                  <strong id="wallet-connect-title">
                    {connectedAddress ? 'Wallet connected' : 'Connect your wallet'}
                  </strong>
                  <p>
                    {connectedAddress
                      ? 'This account is connected and its analytics are loaded.'
                      : 'Choose a wallet, select an account, and approve access inside your wallet.'}
                  </p>
                </div>
              </div>

              {connectedAddress ? (
                <div className="connected-wallet-card">
                  <span className="connected-wallet-card__dot" />
                  <div>
                    <strong>{compactAddress(connectedAddress)}</strong>
                    <small>Connected account</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onDisconnectWallet()
                      setIsWalletPanelOpen(false)
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="wallet-provider-list">
                  {walletProviders.map((walletProvider) => (
                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={() => onConnectWallet(walletProvider)}
                      key={`${walletProvider.rdns}-${walletProvider.name}`}
                    >
                      <span className="wallet-provider-icon">
                        {walletProvider.icon
                          ? <img src={walletProvider.icon} alt="" />
                          : <WalletCards aria-hidden="true" />}
                      </span>
                      <span>
                        <strong>{walletProvider.name}</strong>
                        <small>{isConnecting ? 'Check your wallet to approve...' : 'Request connection permission'}</small>
                      </span>
                      <ChevronDown aria-hidden="true" />
                    </button>
                  ))}

                  {!hasMetaMask && (
                    <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                      <span className="wallet-provider-icon wallet-provider-icon--metamask">M</span>
                      <span><strong>MetaMask</strong><small>Install MetaMask to connect</small></span>
                      <ChevronDown aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}

              {connectionError && <p className="wallet-connect-error" role="alert">{connectionError}</p>}
              <small className="wallet-connect-panel__note">
                MyWallet360 only requests your public address. It cannot access your funds.
              </small>
            </aside>
          )}
        </div>
      </div>
    </header>
  )
}
