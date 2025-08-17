import { sepolia } from 'wagmi/chains'
import { http, createConfig, cookieStorage, createStorage } from 'wagmi'
import { injected, metaMask, safe } from 'wagmi/connectors' // 🚨 removed walletConnect

export const config = createConfig({
  chains: [sepolia],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  connectors: [
    injected(),
    metaMask(),
    safe(),
  ],
  transports: {
    [sepolia.id]: http(),
  },
})

export function getConfig() {
  return createConfig({
    chains: [sepolia],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [sepolia.id]: http(),
    },
  })
}
