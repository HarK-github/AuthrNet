'use client'

import Link from 'next/link'
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function Account() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl border bg-white/4 backdrop-blur-lg text-white shadow-lg px-6 py-4 max-w-full w-[90%] sm:w-auto text-center">
      {isConnected && address ? (
        <div className="flex flex-col items-center gap-2">
          {ensAvatar && (
            <img
              src={ensAvatar}
              alt="ENS Avatar"
              className="w-10 h-10 rounded-full"
             />
          )}
          <div className="text-sm">
            {ensName
              ? `${ensName} (${address.slice(0, 6)}...${address.slice(-4)})`
              : address}
          </div>
          <button
            onClick={() => disconnect()}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="text-sm text-gray-700">Wallet not connected</div>
      )}
    </div>
  )
}
