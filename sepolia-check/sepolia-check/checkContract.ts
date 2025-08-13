import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

// 1. Create a Sepolia RPC client
const client = createPublicClient({
  chain: sepolia,
  transport: http() // You can pass your Infura/Alchemy URL here if you have one
});

// 2. Address to check
const address = "0x177E9303dbcc55009a32e83f39dd981a51077d64";

// 3. Main function
async function main() {
  console.log(`Checking contract bytecode on Sepolia for ${address}...`);

  const code = await client.getCode({ address });

  if (code === "0x") {
    console.error("❌ No contract bytecode found — wrong network or address.");
    return;
  }

  console.log(`✅ Contract bytecode found (length: ${code.length} chars)`);
}

main().catch((err) => {
  console.error("Error running check:", err);
});
