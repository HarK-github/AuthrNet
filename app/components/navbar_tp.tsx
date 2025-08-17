"use client"

import Link from 'next/link'
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function TopNavbar() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  // Shorten address: 0x1234...abcd
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ""

  return (
    <header className={`${geistSans.variable} ${geistMono.variable} fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl rounded-xl bg-gray-900/70 backdrop-blur-md border border-gray-700 shadow-lg text-gray-100`}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo / App Name */}
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-indigo-400 transition-colors">
          Decentralized Publishing
        </Link>

        {/* Center Account Info */}
        {isConnected && address ? (
          <div className="flex items-center gap-3 text-sm">
            {ensAvatar && (
              <img
                src={ensAvatar}
                alt="ENS Avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="text-center">
              {ensName ? `${ensName} (${shortAddress})` : shortAddress}
            </div>
            <button
              onClick={() => disconnect()}
              className="text-sm bg-red-500 hover:bg-red-600 hover:scale-110 text-white px-3 py-1 rounded"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-400 text-center">
            Wallet not connected
          </div>
        )}

        {/* Right nav links */}
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-indigo-300 transition-colors">Articles</Link>
          <Link href="/publish" className="hover:text-indigo-300 transition-colors">Publish</Link>
          <Link href="/support" className="hover:text-indigo-300 transition-colors">Support</Link>
        </nav>
      </div>
    </header>
  )
}
