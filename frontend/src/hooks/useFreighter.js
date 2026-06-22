import { useState, useEffect, useCallback } from 'react'
import {
  isConnected as freighterIsConnected,
  isAllowed,
  requestAccess,
  getAddress
} from '@stellar/freighter-api'

export function useFreighter() {
  const [publicKey, setPublicKey] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // ✅ CHECK CONNECTION (fixed + reset state properly)
  const checkConnection = useCallback(async () => {
    try {
      const { isConnected: conn } = await freighterIsConnected()

      if (!conn) {
        setPublicKey(null)
        setIsConnected(false)
        return
      }

      const allowed = await isAllowed()
      if (!allowed.isAllowed) {
        setPublicKey(null)
        setIsConnected(false)
        return
      }

      const { address } = await getAddress()

      if (!address) {
        setPublicKey(null)
        setIsConnected(false)
        return
      }

      setPublicKey(address)
      setIsConnected(true)

    } catch (e) {
      setPublicKey(null)
      setIsConnected(false)
      setError(e?.message || 'Failed to check wallet')
    }
  }, [])

  // ✅ initial load + auto sync wallet state
  useEffect(() => {
    checkConnection()

    const interval = setInterval(() => {
      checkConnection()
    }, 3000) // auto sync wallet status

    return () => clearInterval(interval)
  }, [checkConnection])

  // ✅ connect wallet
  const connect = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { isConnected: conn } = await freighterIsConnected()

      if (!conn) {
        throw new Error('Freighter tidak ditemukan. Install extension terlebih dahulu.')
      }

      await requestAccess()

      const { address, error: addrErr } = await getAddress()

      if (addrErr) throw new Error(addrErr)
      if (!address) throw new Error('Gagal mendapatkan address wallet.')

      setPublicKey(address)
      setIsConnected(true)

    } catch (e) {
      setError(e?.message || 'Gagal connect wallet')
      setPublicKey(null)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ✅ disconnect (frontend only)
  const disconnect = useCallback(() => {
    setPublicKey(null)
    setIsConnected(false)
    setError(null)
  }, [])

  return {
    publicKey,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    checkConnection
  }
}