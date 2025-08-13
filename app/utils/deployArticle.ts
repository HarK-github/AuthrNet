import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { parseEther } from "viem";
import { config } from "@/app/config";
import {abi as AB} from "@/contracts/abis/ArticleRegistry.json"

const articleRegistryConfig = {
  address: '0x177e9303dbcc55009a32e83f39dd981a51077d64',
  abi: AB,
};

// Publish a new article
export async function publishArticle(
  title: string,
  ipfsHash: string,
  priceInEth: string
): Promise<{ articleId: number; txHash: string }> {
  try {
    const txHash = await writeContract(config, {
      ...articleRegistryConfig,
      functionName: "publishArticle",
      args: [title, ipfsHash, parseEther(priceInEth)],
    });

    const receipt = await waitForTransactionReceipt(config, { hash: txHash });
    
    // Get the article ID from the event logs
    const articleId = await readContract(config, {
      ...articleRegistryConfig,
      functionName: "articleCount",
    }) - 1;

    return { articleId: Number(articleId), txHash };
  } catch (error) {
    console.error("Error publishing article:", error);
    throw error;
  }
}

// Grant access to an article
export async function grantArticleAccess(
  userAddress: string,
  articleId: number
): Promise<{ txHash: string }> {
  try {
    const txHash = await writeContract(config, {
      ...articleRegistryConfig,
      functionName: "grantAccess",
      args: [userAddress, articleId],
    });

    await waitForTransactionReceipt(config, { hash: txHash });
    return { txHash };
  } catch (error) {
    console.error("Error granting access:", error);
    throw error;
  }
}

// Purchase access to an article
export async function purchaseArticleAccess(
  articleId: number,
  priceInEth: string
): Promise<{ txHash: string }> {
  try {
    const txHash = await writeContract(config, {
      ...articleRegistryConfig,
      functionName: "purchaseAccess",
      args: [articleId],
      value: parseEther(priceInEth),
    });

    await waitForTransactionReceipt(config, { hash: txHash });
    return { txHash };
  } catch (error) {
    console.error("Error purchasing access:", error);
    throw error;
  }
}

// Check article details
export async function getArticleDetails(articleId: number) {
  return readContract(config, {
    ...articleRegistryConfig,
    functionName: "getArticle",
    args: [articleId],
  });
}

// Check access permissions
export async function checkArticleAccess(
  userAddress: string,
  articleId: number
): Promise<boolean> {
  return readContract(config, {
    ...articleRegistryConfig,
    functionName: "checkAccess",
    args: [userAddress, articleId],
  });
}