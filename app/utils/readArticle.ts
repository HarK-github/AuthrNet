import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { createPublicClient, getAddress, http, parseEther } from "viem";
import { config } from "@/app/config";
import { abi } from "@/contracts/abis/ArticleRegistry.json";
import { publishingHubConfig } from "./contractHelpers";
import { sepolia } from "viem/chains";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;


export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
}); 
const articleRegistryConfig = { 
  address:  getAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string),
  abi: abi,
};

// Type definitions
interface Article {
  title: string;
  ipfsHash: string;
  price: bigint;
  publisher: string; 
}

interface ArticleList {
  ids: bigint[];
  titles: string[];
  ipfsHashes: string[];
  prices: bigint[];
  publishers: string[];
  existsFlags: boolean[];
}
export async function getArticleCount() {
  try {
    const count = await readContract(config,{
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: publishingHubConfig.abi,
      functionName: "articleCount",
    }); 
    return Number(count); // count will be bigint
  } catch (error) {
    console.error("Error reading articleCount:", error);
    throw error;
  }
}

export async function getArticleDetails(
  articleId: number,
  userAddress: string
): Promise<Article> {
  const [title, ipfsHash, price, publisher] = await readContract(config, {
    ...articleRegistryConfig,
    functionName: "getArticle",
    args: [articleId, userAddress],
  }) as [string, string, bigint, string];

  return { title, ipfsHash, price, publisher };
}


export async function getAllArticles(
  userAddress: string
): Promise<ArticleList> {
  return await readContract(config, {
    ...articleRegistryConfig,
    functionName: "getArticle",
    args: [userAddress],
  }) as Promise<ArticleList>;
}

export async function checkArticleAccess(
  userAddress: string, 
  articleId: number
): Promise<boolean> {
  return await readContract(config, {
    ...articleRegistryConfig,
    functionName: "checkAccess",
    args: [userAddress, articleId],
  }) as Promise<boolean>;
}

// Write functions
export async function publishArticle(
  title: string,
  ipfsHash: string,
  priceInEth: string
): Promise<{ articleId: number; txHash: string }> {
  const txHash = await writeContract(config, {
    ...articleRegistryConfig,
    functionName: "publishArticle",
    args: [title, ipfsHash, parseEther(priceInEth)],
  });

  await waitForTransactionReceipt(config, { hash: txHash });
  
  const count = await getArticleCount();
  return { articleId: count - 1, txHash };
}

export async function grantAccess(
  userAddress: string,
  articleId: number
): Promise<{ txHash: string }> {
  const txHash = await writeContract(config, {
    ...articleRegistryConfig,
    functionName: "grantAccess",
    args: [userAddress, articleId],
  });

  await waitForTransactionReceipt(config, { hash: txHash });
  return { txHash };
}

export async function purchaseAccess(
  articleId: number,
  priceInEth: string
): Promise<{ txHash: string }> {
  const txHash = await writeContract(config, {
    ...articleRegistryConfig,
    functionName: "purchaseAccess",
    args: [articleId],
    value: parseEther(priceInEth),
  });

  await waitForTransactionReceipt(config, { hash: txHash });
  return { txHash };
}