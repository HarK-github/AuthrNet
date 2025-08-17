"use client";

import * as React from "react";
import { WagmiProvider, useAccount } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletOptions } from "./components/wallet-options";
import { TopNavbar } from "./components/navbar_tp";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, BookOpen, Globe } from "lucide-react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

const queryClient = new QueryClient();

// ✅ Stable ErrorFallback component
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="p-6 bg-red-900/40 text-red-200 rounded-lg">
      <p className="font-semibold">Something went wrong:</p>
      <pre className="text-sm">{error.message}</pre>
      <button
        className="mt-2 px-3 py-1 bg-red-700 rounded"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
}

function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = React.useState(false);

  // ✅ Avoid hydration mismatch
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0f1f] text-gray-100 flex flex-col">
        <TopNavbar />

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between px-10 py-20 gap-12">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Welcome to <span className="text-blue-400">DecentraArticles</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              A decentralized publishing hub where{" "}
              <span className="text-blue-300 font-semibold">
                knowledge meets ownership
              </span>
              . Upload, share, and monetize your work securely with{" "}
              <span className="text-blue-300 font-semibold">
                IPFS & Ethereum
              </span>.
            </p>
          </div>

          <div className="w-full max-w-md bg-[#111827] p-6 rounded-xl border border-[#1e3a8a] shadow-lg shadow-blue-900/40">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">
              Get Started
            </h2>
            <WalletOptions />
          </div>
        </section>

        {/* Features */}
        <section className="px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-[#111827] border border-[#1e3a8a] shadow-md shadow-blue-900/30">
            <CardHeader>
              <Shield className="w-10 h-10 text-blue-400 mb-2" />
              <CardTitle className="text-blue-200">Secure Publishing</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              Articles live on IPFS and Ethereum, ensuring censorship-resistance
              and tamper-proof publishing.
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border border-[#1e3a8a] shadow-md shadow-blue-900/30">
            <CardHeader>
              <BookOpen className="w-10 h-10 text-blue-400 mb-2" />
              <CardTitle className="text-blue-200">Monetize Knowledge</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              Add a paywall to your work and earn directly from readers who
              value your insights.
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border border-[#1e3a8a] shadow-md shadow-blue-900/30">
            <CardHeader>
              <Globe className="w-10 h-10 text-blue-400 mb-2" />
              <CardTitle className="text-blue-200">Global Access</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              Your content is available worldwide — resistant to censorship and
              open to everyone.
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <>
      <TopNavbar />
      {children}
    </>
  );
}

export default function Provider({
  children,
  initialState,
}: Readonly<{
  children: React.ReactNode;
  initialState: import("wagmi").State | undefined;
}>) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <WalletGate>{children}</WalletGate>
        </ErrorBoundary>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
