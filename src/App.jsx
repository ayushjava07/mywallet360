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
    setSearchValue,
    searchWallet,
    selectExampleWallet,
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
        onSelectExampleWallet={selectExampleWallet}
        isLoading={isLoading}
        exampleWallets={exampleWallets}
        theme={theme}
        onToggleTheme={toggleTheme}
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
          <h2>Enter a wallet address to begin</h2>
          <p>No wallet data is loaded by default. Search an Ethereum address or choose an example wallet above.</p>
        </main>
      )}
    </div>
  )
}
