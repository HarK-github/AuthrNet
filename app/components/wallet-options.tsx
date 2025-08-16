"use client"

import * as React from "react"
import { useConnect, Connector } from "wagmi"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function WalletOptions() {
  const { connectors, connect, isLoading, pendingConnector } = useConnect()

  return (
    <Card className="w-full max-w-sm mx-auto mt-10 bg-[#121212] border border-[#2c2c2c] text-gray-100 shadow-2xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-100">
          Connect Your Wallet
        </CardTitle>
        <CardDescription className="text-gray-400">
          Choose a wallet to sign in and continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {connectors.map((connector) => (
          <WalletButton
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector })}
            isPending={isLoading && pendingConnector?.uid === connector.uid}
          />
        ))}
      </CardContent>
      <CardFooter className="text-xs text-gray-500 border-t border-[#2c2c2c] pt-3">
        You must connect a wallet before publishing or reading paywalled content.
      </CardFooter>
    </Card>
  )
}

function WalletButton({
  connector,
  onClick,
  isPending,
}: {
  connector: Connector
  onClick: () => void
  isPending?: boolean
}) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      const provider = await connector.getProvider()
      setReady(!!provider)
    })()
  }, [connector])

  return (
    <Button
      onClick={onClick}
      disabled={!ready}
      className="w-full justify-center py-2 px-4 rounded-xl bg-[#1f1f1f] border border-[#3c3c3c] text-gray-200 hover:bg-[#2a2a2a] hover:border-[#5c5c5c] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
    >
      {isPending ? `Connecting to ${connector.name}...` : `Connect with ${connector.name}`}
    </Button>
  )
}