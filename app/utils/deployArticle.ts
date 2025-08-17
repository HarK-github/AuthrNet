import { writeContract, waitForTransactionReceipt, readContract } from "wagmi/actions";
import { parseEther } from "viem";
import { config } from "@/app/config";
import { abi as AB } from "@/contracts/abis/ArticleRegistry.json";

// -------------------- Helper --------------------
function getContract() {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;
  if (!addr) throw new Error("❌ NEXT_PUBLIC_CONTRACT_ADDRESS is not set");
  return { address: addr, abi: AB };
}

// -------------------- Publish a new article --------------------
export async function publishArticle(
  title: string,
  ipfsHash: string,
  priceInEth: string
): Promise<{ articleId: number; txHash: string }> {
  try {
    const txHash = await writeContract(config, {
      ...getContract(),
      functionName: "publishArticle",
      args: [title, ipfsHash, parseEther(priceInEth)],
    });

    await waitForTransactionReceipt(config, { hash: txHash });

    const articleCount = await readContract(config, {
      ...getContract(),
      functionName: "articleCount",
    });

    return { articleId: Number(articleCount) - 1, txHash };
  } catch (error) {
    console.error("Error publishing article:", error);
    throw error;
  }
}

// -------------------- Grant access --------------------
export async function grantArticleAccess(userAddress: string, articleId: number) {
  const txHash = await writeContract(config, {
    ...getContract(),
    functionName: "grantAccess",
    args: [userAddress, articleId],
  });

  await waitForTransactionReceipt(config, { hash: txHash });
  return { txHash };
}

// -------------------- Purchase access --------------------
export async function purchaseArticleAccess(articleId: number, priceInEth: string) {
  const txHash = await writeContract(config, {
    ...getContract(),
    functionName: "purchaseAccess",
    args: [articleId],
    value: parseEther(priceInEth),
  });

  await waitForTransactionReceipt(config, { hash: txHash });
  return { txHash };
}

// -------------------- Get article details --------------------
export async function getArticleDetails(articleId: number) {
  return readContract(config, {
    ...getContract(),
    functionName: "getArticle",
    args: [articleId],
  });
}

// -------------------- Check access --------------------
export async function checkArticleAccess(userAddress: string, articleId: number): Promise<boolean> {
  return (await readContract(config, {
    ...getContract(),
    functionName: "checkAccess",
    args: [userAddress, articleId],
  })) as boolean;
}

// -------------------- Get all articles --------------------
export async function getAllArticles() {
  return readContract(config, {
    ...getContract(),
    functionName: "getArticles",
    args: ["0x0000000000000000000000000000000000000000"],
  });
}

// -------------------- Get owner --------------------
export async function getContractOwner(): Promise<string> {
  return (await readContract(config, {
    ...getContract(),
    functionName: "owner",
  })) as string;
}
