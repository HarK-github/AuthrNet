import { abi as publishingHubAbi } from "@/contracts/abis/ArticleRegistry.json"
import { Address, getAddress } from "viem"

// Replace with your deployed PublishingHub contract address
export const PUBLISHING_HUB_ADDRESS =  process.env?.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const publishingHubConfig = {
  address: PUBLISHING_HUB_ADDRESS as Address,
  abi: publishingHubAbi,
}
