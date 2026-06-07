import { useState } from 'react'
import { walletService } from '../services/walletService'

export function useWalletDashboard() {
  const [wallet, setWallet] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeWallet = async (address) => {
    if (isLoading) return

    setIsLoading(true)
    setError('')

    try {
      const nextWallet = await walletService.getWalletByAddress(address)
      setWallet(nextWallet)
      setSearchValue(nextWallet.id)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const searchWallet = () => analyzeWallet(searchValue)
  const selectExampleWallet = (address) => {
    setSearchValue(address)
    analyzeWallet(address)
  }

  return {
    error,
    wallet,
    searchValue,
    isLoading,
    setSearchValue,
    searchWallet,
    selectExampleWallet,
  }
}
