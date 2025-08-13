import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { parseEther } from "viem";
import { config } from "@/app/config";
import { abi as AB } from "@/contracts/abis/ArticleRegistry.json";

const articleRegistryConfig = {
  address: '0x177e9303dbcc55009a32e83f39dd981a51077d64',
  abi: AB,
};

// -------------------- Publish a new article --------------------
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

    await waitForTransactionReceipt(config, { hash: txHash });

    // articleCount returns the total number of articles; the latest ID is count - 1
    const articleId = Number(await readContract(config, {
      ...articleRegistryConfig,
      functionName: "articleCount",
    })) - 1;

    return { articleId, txHash };
  } catch (error) {
    console.error("Error publishing article:", error);
    throw error;
  }
}

// -------------------- Grant access to an article --------------------
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

// -------------------- Purchase access to an article --------------------
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

// -------------------- Get article details --------------------
export async function getArticleDetails(articleId: number) {
  return readContract(config, {
    ...articleRegistryConfig,
    functionName: "getArticle",
    args: [articleId],
  });
}

// -------------------- Check if a user has access --------------------
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

// -------------------- Get all articles --------------------
export async function getAllArticles() {
  return readContract(config, {
    ...articleRegistryConfig,
    functionName: "getArticles",
    args: [/* pass user address if needed, or use zero address */ "0x0000000000000000000000000000000000000000"],
  });
}

// -------------------- Get contract owner --------------------
export async function getContractOwner(): Promise<string> {
  return readContract(config, {
    ...articleRegistryConfig,
    functionName: "owner",
  });
}
