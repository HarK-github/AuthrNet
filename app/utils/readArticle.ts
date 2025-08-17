import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { getAddress, parseEther } from "viem";
import { config } from "@/app/config";
import { abi } from "@/contracts/abis/ArticleRegistry.json";
import { publishingHubConfig } from "./contractHelpers";

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

export async function getArticleCount(contractAddress: string) {
  try {
    const count = await readContract(config, {
      address: getAddress(contractAddress),
      abi: publishingHubConfig.abi,
      functionName: "articleCount",
    });
    return Number(count);
  } catch (error) {
    console.error("Error reading articleCount:", error);
    throw error;
  }
}

export async function getArticleDetails(
  articleId: number,
  userAddress: string,
  contractAddress: string
): Promise<Article> {
  const [title, ipfsHash, price, publisher] = (await readContract(config, {
    address: getAddress(contractAddress),
    abi,
    functionName: "getArticle",
    args: [articleId, userAddress],
  })) as [string, string, bigint, string];

  return { title, ipfsHash, price, publisher };
}

export async function getAllArticles(
  userAddress: string,
  contractAddress: string
): Promise<ArticleList> {
  return (await readContract(config, {
    address: getAddress(contractAddress),
    abi,
    functionName: "getArticle",
    args: [userAddress],
  })) as ArticleList;
}

export async function checkArticleAccess(
  userAddress: string,
  articleId: number,
  contractAddress: string
): Promise<boolean> {
  return (await readContract(config, {
    address: getAddress(contractAddress),
    abi,
    functionName: "checkAccess",
    args: [userAddress, articleId],
  })) as boolean;
}

// Write functions
export async function publishArticle(
  title: string,
  ipfsHash: string,
  priceInEth: string,
  contractAddress: string
): Promise<{ articleId: number; txHash: string }> {
  const txHash = await writeContract(config, {
    address: getAddress(contractAddress),
    abi,
    functionName: "publishArticle",
    args: [title, ipfsHash, parseEther(priceInEth)],
  });

  await waitForTransactionReceipt(config, { hash: txHash });

  const count = await getArticleCount(contractAddress);
  return { articleId: count - 1, txHash };
}

export async function grantAccess(
  userAddress: string,
  articleId: number,
  contractAddress: string
): Promise<{ txHash: string }> {
  const txHash = await writeContract(config, {
    address: getAddress(contractAddress),
    abi,
    functionName: "grantAccess",
    args: [userAddress, articleId],
  });

  await waitForTransactionReceipt(config, { hash: txHash });
  return { txHash };
}

export async function purchaseAccess(
  articleId: number,
  priceInEth: string,
  contractAddress: string
): Promise<{ txHash: string }> {
  const txHash = await writeContract(config, {
    address: getAddress(contractAddress),
    abi,
    functionName: "purchaseAccess",
    args: [articleId],
    value: parseEther(priceInEth),
  });

  await waitForTransactionReceipt(config, { hash: txHash });
  return { txHash };
}
