Here’s a rewritten, polished version of your **README.md** with a centered title, GitHub-style badges (for deployment, progress, license, etc.), and a cleaner structure for readability:

````markdown
<div align="center">

# 🚀 AuthrNet  

**Decentralized Article Publishing & Access Control Platform**  

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)  
[![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-3C3C3D?logo=ethereum)](https://ethereum.org/)  
[![IPFS](https://img.shields.io/badge/IPFS-Pinata-65C2CB?logo=ipfs)](https://ipfs.tech/)  
[![Deployment](https://img.shields.io/badge/Deployed-✓-brightgreen)](#)  
[![Progress](https://img.shields.io/badge/Status-In%20Progress-yellow)](#)  
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  

</div>

---

## 📖 Table of Contents

- [ Features](#-features)  
- [ Tech Stack](#-tech-stack)  
- [ Installation](#-installation)  
- [ Project Structure](#-project-structure)  
- [ File Structure (Detailed)](#-file-structure-detailed)  
- [ Usage](#-usage)  
- [ Contracts](#-contracts)  
- [ Scripts & Utilities](#-scripts--utilities)  
- [ Contributing](#-contributing)  
- [ License](#-license)  
- [ Back to Top](#-authrnet)  

---

## ✨ Features  

-  Web3 authentication with **Wagmi** and **MetaMask**  
-  Article publishing with **IPFS (Pinata)**  
-  Premium access with **ETH-based unlocking**  
-  Profile & dashboard for authored and purchased articles  
-  Modern UI with **dark theme** & responsive design  
-  Solidity-powered **ArticleRegistry Smart Contract**  

---

## 🛠 Tech Stack  

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, ShadCN UI  
- **Blockchain**: Solidity, Wagmi, viem  
- **Storage**: IPFS (Pinata)  
- **Other**: React Query, Lucide Icons  

---

## ⚡ Installation  

### 1. Clone & Install  

```bash
git clone https://github.com/yourusername/authrnet.git
cd authrnet

# Install dependencies
npm install
````

### 2. Configure Environment

Create `.env.local` in the root:

```bash
AUTH_SECRET=

# Pinata API keys
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_API_KEY=

# Deployed smart contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

### 3. Run

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

##  Project Structure

```
AuthrNet/
├── app/             # Next.js app pages & APIs
├── components/      # Reusable UI components
├── contracts/       # Solidity contracts & ABIs
├── lib/             # Helpers / configs
├── public/          # Static assets
├── .env             # Env variables
├── package.json     # Scripts & deps
└── tsconfig.json    # TypeScript config
```

---

##  File Structure (Detailed)

### App (`./app`)

```
app/
├── api
│   └── auth/ipfs/[hash]/route.ts   # Fetch IPFS content
├── auth.config.ts                  # Auth settings
├── components/
│   ├── connected.tsx               # Wallet view
│   ├── navbar_tp.tsx               # Navigation bar
│   ├── profile.tsx                 # User profile
│   └── wallet-options.tsx          # Wallet connect UI
├── config.ts                       # Wagmi / chain config
├── layout.tsx                      # Root layout
├── page.tsx                        # Landing page
├── publish/page.tsx                # Publish article page
├── read/[id]/page.tsx              # Read article page
├── support/page.tsx                # Support page
└── utils/
    ├── articleRegistry.ts
    ├── contractHelpers.ts
    ├── deployArticle.ts
    ├── readArticle.ts
    ├── supportArticle.ts
    └── uploadToPinata.ts
```

### Contracts (`./contracts`)

```
contracts/
└── abis
    ├── ArticleRegistry.json     # ABI
    └── ArticleRegistry.sol      # Solidity source
```

---

## 🚀 Usage

1. Connect wallet (MetaMask).
2. Browse free articles.
3. Unlock premium articles with ETH.
4. Publish your own articles via IPFS.

---

##  Contracts

* **ArticleRegistry.sol** – Manages publishing, ownership, and premium access.

Deploy:

```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

---

## Scripts & Utilities

* `uploadToPinata.ts` – Upload articles to IPFS
* `readArticle.ts` – Fetch article metadata & access
* `deployArticle.ts` – Smart contract deployment
* `supportArticle.ts` – Support authors with ETH

---

##  Contributing

Pull requests are welcome. Open an issue first to discuss major changes.

---

##  License

Licensed under the **MIT License**.

---

##  Back to Top

[⬆ Back to Top](#-authrnet)

```
 