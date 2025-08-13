import { abi as publishingHubAbi } from "@/contracts/abis/ArticleRegistry.json"
import { Address, getAddress } from "viem"

// Replace with your deployed PublishingHub contract address
export const PUBLISHING_HUB_ADDRESS =  "0x177e9303dbcc55009a32e83f39dd981a51077d64";

export const publishingHubConfig = {
  address: PUBLISHING_HUB_ADDRESS as Address,
  abi: publishingHubAbi,
}
