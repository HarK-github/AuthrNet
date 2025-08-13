import { createPublicClient, http, getAddress } from "viem";
import { sepolia } from "viem/chains";

// Normalize address to EIP-55 checksum format
const address = getAddress("0x177E9303dbcc55009a32e83f39dd981a51077d64");

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

// Minimal ABI for articleCount()
const abi = [
  {
    "inputs": [],
    "name": "articleCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
  console.log(`Checksummed address: ${address}`);

  const code = await client.getCode({ address });
  if (code === "0x") {
    console.error("❌ No contract bytecode found — wrong network or address.");
    return;
  }
  console.log(`✅ Contract bytecode found (length: ${code.length} chars)`);

  try {
    const count = await client.readContract({
      address,
      abi,
      functionName: "articleCount"
    });
    console.log(`📄 articleCount: ${count.toString()}`);
  } catch (err) {
    console.error("⚠️ Could not read articleCount:", err.message);
  }
}

main().catch(console.error);
