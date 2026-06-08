import { useEffect, useRef } from 'react'
import { ArrowUpRight, Bell, Moon, Search, Sun, WalletCards } from 'lucide-react'

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
            placeholder="Paste an Ethereum address (0x...)"
            aria-label="Ethereum wallet address"
          />
          <button disabled={isLoading} type="submit">{isLoading ? 'Loading...' : 'View analytics'}</button>
        </form>
        {searchError && <span className="wallet-search-error" role="alert">{searchError}</span>}
        <div className="example-wallets">
          <span>Or try an example</span>
          <div>
            {exampleWallets.map((exampleWallet) => (
              <button
                className={wallet?.id === exampleWallet.address ? 'active' : ''}
                disabled={isLoading}
                type="button"
                onClick={() => onSelectExampleWallet(exampleWallet.address)}
                key={exampleWallet.address}
                title={`Analyze ${exampleWallet.address}`}
                aria-label={`Analyze example address ${exampleWallet.address}`}
              >
                <span>{compactAddress(exampleWallet.address)}</span>
                <ArrowUpRight aria-hidden="true" />
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
        <div className="wallet-pill" role="status" aria-live="polite">
          <span className="wallet-pill__dot" />
          <span className="wallet-pill__copy">
            <strong>{wallet ? 'Address analyzed' : 'No address selected'}</strong>
            <small>{wallet ? wallet.profile.wallet : 'Search or try an example'}</small>
          </span>
        </div>
      </div>
    </header>
  )
}
