"use client"

import { WagmiProvider } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Profile } from "./components/profile";
import { Account } from "./components/account";
import { WalletOptions } from "./components/wallet-options";
import { useAccount } from "wagmi";
import type { State } from "wagmi"; // Make sure this is imported

const queryClient = new QueryClient();

function WalletGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <WalletOptions />;
  }

  return (
    <>
    <Account />
      {children}
      <Profile />
    </>
  );
}

export default function Provider({
  children,
  initialState,
}: Readonly<{
  children: React.ReactNode;
  initialState: State | undefined;
}>) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <WalletGate>{children}</WalletGate>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
