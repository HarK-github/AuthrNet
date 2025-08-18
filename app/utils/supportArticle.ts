import type { Address } from "viem";
import {abi as ArticleRegistryABI} from '@/contracts/abis/ArticleRegistry.json';
import { sepolia } from 'wagmi/chains';
import { getPublicClient, getWalletClient } from '@wagmi/core';
import { config } from '@/app/config';

// ---------------------
// Types
// ---------------------
export interface Author {
  address: string;
  articleCount: number;
}

export interface Article {
  id: number;
  title: string;
  ipfsHash: string;
  price: number;
  publisher: string;
  exists: boolean;
}

// ---------------------
// Helper to get client from config
// ---------------------
function getClient() {
  return getPublicClient({ chainId: sepolia.id, ...config });
}

function getWallet() {
  return getWalletClient({ chainId: sepolia.id, ...config });
}

// ---------------------
// Fetch All Authors
// ---------------------
export async function fetchAllAuthors(CONTRACT_ADDRESS:string): Promise<Author[]> { 
  try {
    const client = getClient();

    const result = await client.readContract({
      address: CONTRACT_ADDRESS as Address,
      abi: ArticleRegistryABI,
      functionName: "getAllAuthors",
    }) as [string[], bigint[]];  // <-- explicitly typed

    const [authors, counts] = result;

    if (!authors || !counts) return [];

    return authors.map((addr, i) => ({
      address: addr,
      articleCount: Number(counts[i]),
    }));
  } catch (err) {
    console.error("Failed to fetch authors:", err);
    return [];
  }
}


// ---------------------
// Fetch Articles
// ---------------------
export async function fetchArticles(userAddress: string,CONTRACT_ADDRESS:string): Promise<Article[]> {
  try {
    const client = getClient();
    const result = await client.readContract({
      address: CONTRACT_ADDRESS as Address,
      abi: ArticleRegistryABI,
      functionName: 'getArticles',
      args: [userAddress],
    });

    const [ids, titles, ipfsHashes, prices, publishers, existsFlags] = result as [
      bigint[],
      string[],
      string[],
      bigint[],
      string[],
      boolean[]
    ];

    return ids.map((id, i) => ({
      id: Number(id),
      title: titles[i],
      ipfsHash: ipfsHashes[i],
      price: Number(prices[i]),
      publisher: publishers[i],
      exists: existsFlags[i],
    }));
  } catch (err) {
    console.error("Failed to fetch articles:", err);
    return [];
  }
}

// ---------------------
// Support an Author
// ---------------------
export async function supportAuthor(authorAddress: string, amountEth: string,CONTRACT_ADDRESS:string): Promise<string> {
  try {
    const walletClient = await getWallet();
    const txHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as Address,
      abi: ArticleRegistryABI,
      functionName: 'supportAuthor',
      args: [authorAddress as Address],
      value: BigInt(Math.floor(parseFloat(amountEth) * 1e18)),
    });
    const publicClient = getClient();
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    return txHash; // return string
  } catch (err) {
    console.error("Support transaction failed:", err);
    throw err;
  }
}


// ---------------------
// Purchase Article Access
// ---------------------
export async function purchaseArticle(articleId: number, amountEth: string,CONTRACT_ADDRESS:string) {
  try {
    const walletClient = await getWallet();
    const txHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS as Address,
      abi: ArticleRegistryABI,
      functionName: 'purchaseAccess',
      args: [BigInt(articleId)],
      value: BigInt(Math.floor(parseFloat(amountEth) * 1e18)),
    });
      const publicClient = getClient();
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    return txHash;
  } catch (err) {
    console.error("Purchase transaction failed:", err);
    throw err;
  }
}
