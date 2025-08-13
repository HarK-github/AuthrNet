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
    <Card className="w-full max-w-sm mx-auto mt-10 bg-[#fdf6e3] border-[#93a1a1] text-[#002b36]">
      <CardHeader>
        <CardTitle className="text-[#073642]">Connect Your Wallet</CardTitle>
        <CardDescription>
          Choose a wallet to sign in and continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {connectors.map((connector) => (
          <WalletButton
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector })}
            isPending={isLoading && pendingConnector?.uid === connector.uid}
          />
        ))}
      </CardContent>
      <CardFooter className="text-xs text-[#657b83]">
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
      className="w-full text-[#002b36] bg-[#eee8d5] border border-[#93a1a1] hover:bg-[#e0dbcd]"
    >
      {isPending ? `Connecting to ${connector.name}...` : `Connect with ${connector.name}`}
    </Button>
  )
}
