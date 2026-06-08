import { Activity } from './components/dashboard/Activity'
import { AIInsights } from './components/dashboard/AIInsights'
import { BalanceCard } from './components/dashboard/BalanceCard'
import { DashboardLoader } from './components/dashboard/DashboardLoader'
import { IdentityCard } from './components/dashboard/IdentityCard'
import { Insights } from './components/dashboard/Insights'
import { PortfolioCard } from './components/dashboard/PortfolioCard'
import { Summary } from './components/dashboard/Summary'
import { WalletPersonality } from './components/dashboard/WalletPersonality'
import { BottomNav } from './components/layout/BottomNav'
import { Header } from './components/layout/Header'
import { useTheme } from './hooks/useTheme'
import { useWalletDashboard } from './hooks/useWalletDashboard'
import { walletService } from './services/walletService'

const exampleWallets = walletService.listExampleWallets()

export default function App() {
  const {
    wallet,
    error,
    searchValue,
    isLoading,
    isResolving,
    resolvedIdentifier,
    setSearchValue,
    searchWallet,
    selectExampleWallet,
    connectedAddress,
    walletProviders,
    isConnecting,
    connectionError,
    connectWallet,
    disconnectWallet,
  } = useWalletDashboard()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-shell">
      <Header
        wallet={wallet}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={searchWallet}
        searchError={error}
        resolvedIdentifier={resolvedIdentifier}
        onSelectExampleWallet={selectExampleWallet}
        isLoading={isLoading}
        isResolving={isResolving}
        exampleWallets={exampleWallets}
        theme={theme}
        onToggleTheme={toggleTheme}
        connectedAddress={connectedAddress}
        walletProviders={walletProviders}
        isConnecting={isConnecting}
        connectionError={connectionError}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
      />

      {wallet ? (
        <>
          <main className={isLoading ? 'dashboard-loading' : 'dashboard-ready'} key={wallet.id}>
            {isLoading && <DashboardLoader />}
            <div className="dashboard-grid dashboard-grid--top">
              <BalanceCard balance={wallet.balance} />
              <PortfolioCard portfolio={wallet.portfolio} />
              <IdentityCard stats={wallet.identity} />
              <WalletPersonality personality={wallet.personality} />
            </div>
            <AIInsights ai={wallet.ai} />
            <Summary flow={wallet.flow} />
            <Activity transactions={wallet.transactions} highlights={wallet.highlights} />
            <Insights insights={wallet.insights} />
          </main>
          <BottomNav />
        </>
      ) : (
        <main className="wallet-empty-state">
          {isLoading && <DashboardLoader />}
          <span>Wallet analytics</span>
          <h2>Enter a wallet address or ENS name</h2>
          <p>Search an Ethereum address or .eth name to load its on-chain analytics.</p>
        </main>
      )}
    </div>
  )
}
