import { useEffect, useRef } from 'react'
import { Bell, ChevronDown, Moon, Search, Sun, WalletCards } from 'lucide-react'

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
    }

    window.addEventListener('keydown', handleSearchShortcut)
    return () => window.removeEventListener('keydown', handleSearchShortcut)
  }, [onSearchChange])

  return (
    <header className="header">
      <div className="profile header__profile">
        <div className="profile__image-wrap">
          <span className="profile__placeholder"><WalletCards aria-hidden="true" /></span>
          {wallet && <span className="profile__status" aria-label="Wallet loaded" />}
        </div>
        <div>
          <span className="eyebrow">{wallet ? 'Analyzing wallet' : 'Welcome to'}</span>
          <h1>{wallet ? wallet.profile.name : 'MyWallet360'}</h1>
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
          <span>Example Wallets</span>
          <div>
            {exampleWallets.map((exampleWallet) => (
              <button
                className={wallet?.id === exampleWallet.address ? 'active' : ''}
                disabled={isLoading}
                type="button"
                onClick={() => onSelectExampleWallet(exampleWallet.address)}
                key={exampleWallet.address}
              >
                {exampleWallet.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="header__actions">
        <button className="icon-button" type="button" aria-label="View notifications">
          <Bell aria-hidden="true" />
          <span className="notification-dot" />
        </button>
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
