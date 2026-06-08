import { useCallback, useEffect, useRef, useState } from 'react'
import { walletService } from '../services/walletService'

export function useWalletDashboard() {
  const [wallet, setWallet] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectedAddress, setConnectedAddress] = useState('')
  const [connectedProvider, setConnectedProvider] = useState(null)
  const [walletProviders, setWalletProviders] = useState([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const isLoadingRef = useRef(false)

  const analyzeWallet = useCallback(async (address) => {
    if (isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoading(true)
    setError('')

    try {
      const nextWallet = await walletService.getWalletByAddress(address)
      setWallet(nextWallet)
      setSearchValue(nextWallet.id)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [])

  const searchWallet = () => analyzeWallet(searchValue)
  const selectExampleWallet = (address) => {
    setSearchValue(address)
    analyzeWallet(address)
  }

  useEffect(() => {
    const addProvider = (provider, info = {}) => {
      if (!provider) return

      setWalletProviders((currentProviders) => {
        if (currentProviders.some((item) => item.provider === provider)) return currentProviders

        return [...currentProviders, {
          provider,
          name: info.name || (provider.isMetaMask ? 'MetaMask' : 'Browser Wallet'),
          icon: info.icon || '',
          rdns: info.rdns || '',
        }]
      })
    }

    const handleProviderAnnouncement = (event) => {
      addProvider(event.detail.provider, event.detail.info)
    }

    window.addEventListener('eip6963:announceProvider', handleProviderAnnouncement)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    const injectedProviders = window.ethereum?.providers || (window.ethereum ? [window.ethereum] : [])
    injectedProviders.forEach((provider) => addProvider(provider))

    return () => window.removeEventListener('eip6963:announceProvider', handleProviderAnnouncement)
  }, [])

  useEffect(() => {
    if (!connectedProvider?.on) return undefined

    const handleAccountsChanged = (accounts) => {
      const nextAddress = accounts[0] || ''
      setConnectedAddress(nextAddress)

      if (nextAddress) {
        setSearchValue(nextAddress)
        analyzeWallet(nextAddress)
      } else {
        setConnectedProvider(null)
      }
    }

    connectedProvider.on('accountsChanged', handleAccountsChanged)
    return () => connectedProvider.removeListener?.('accountsChanged', handleAccountsChanged)
  }, [analyzeWallet, connectedProvider])

  const connectWallet = async (walletProvider) => {
    setIsConnecting(true)
    setConnectionError('')

    try {
      const accounts = await walletProvider.provider.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]

      if (!address) throw new Error('No wallet account was selected.')

      setConnectedProvider(walletProvider.provider)
      setConnectedAddress(address)
      setSearchValue(address)
      await analyzeWallet(address)
    } catch (requestError) {
      const message = requestError.code === 4001
        ? 'Connection request was cancelled.'
        : requestError.message || 'Unable to connect wallet.'
      setConnectionError(message)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setConnectedAddress('')
    setConnectedProvider(null)
    setConnectionError('')
  }

  return {
    error,
    wallet,
    searchValue,
    isLoading,
    setSearchValue,
    searchWallet,
    selectExampleWallet,
    connectedAddress,
    walletProviders,
    isConnecting,
    connectionError,
    connectWallet,
    disconnectWallet,
  }
}
