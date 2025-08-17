import ArticleRegistry from "@/contracts/abis/ArticleRegistry.json"

export const articleRegistryConfig = {
  address: process.env?.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
  abi: ArticleRegistry.abi,
} as const
