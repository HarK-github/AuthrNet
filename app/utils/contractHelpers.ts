import { abi as publishingHubAbi } from "@/contracts/abis/ArticleRegistry.json"
import { Address, getAddress } from "viem"

// Replace with your deployed PublishingHub contract address
export const PUBLISHING_HUB_ADDRESS =  "0x6f340420ac266c332cdda5c05ad5f75a10ed5e9a";

export const publishingHubConfig = {
  address: PUBLISHING_HUB_ADDRESS as Address,
  abi: publishingHubAbi,
}
