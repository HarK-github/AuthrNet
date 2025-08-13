"use client"

import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { getArticleCount, getArticleDetails, checkArticleAccess, purchaseAccess } from "@/app/utils/readArticle"
import { url } from "inspector"
import { redirect } from "next/dist/server/api-utils"

type Article = {
  id: number
  title: string
  ipfsHash: string
  price: string
  author: string
  hasAccess: boolean
}


export default function HomePage() {
  const [publicArticles, setPublicArticles] = useState<Article[]>([])
  const [ownedArticles, setOwnedArticles] = useState<Article[]>([])
  const [lockedArticles, setLockedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasingId, setPurchasingId] = useState<number | null>(null)

  const { address: userAddress, isConnected } = useAccount()

  const fetchArticles = async () => {
    if (!isConnected || !userAddress) return
    setLoading(true)

    try {
      const total = await getArticleCount()
      const articles: Article[] = []

      for (let i = 0; i < total; i++) {
        const [title, ipfsHash, priceBN, author] = await getArticleDetails(i, userAddress)
        const price = formatEther(priceBN)
        const hasAccess = await checkArticleAccess(userAddress, i)

        articles.push({ id: i, title, ipfsHash, price, author, hasAccess })
      }

      setPublicArticles(articles.filter(a => a.price === "0"))
      setOwnedArticles(articles.filter(a => a.price !== "0" && a.hasAccess))
      setLockedArticles(articles.filter(a => a.price !== "0" && !a.hasAccess))
    } catch (err) {
      console.error("Error fetching articles:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [isConnected, userAddress])

  const handlePurchase = async (articleId: number, price: string) => {
    try {
      setPurchasingId(articleId)
      await purchaseAccess(articleId, price)
      await fetchArticles() // Refresh after purchase
    } catch (err) {
      console.error("Purchase failed:", err)
    } finally {
      setPurchasingId(null)
    }
  }

  if (!isConnected) {
    return <div className="p-10 text-center">Please connect your wallet to view articles.</div>
  }

  if (loading) {
  return (
    <div className="flex justify-center items-center h-screen">
      <img src="/loading-who.gif" alt="Loading..." className="w-100 h-100" />
    </div>
  )
}


  return (
    <div className="p-4">
  {/* Main Heading */}
  <h1 className="text-4xl font-bold text-gray-100 mb-8">
    Articles Dashboard
  </h1>

  {/* Article Sections */}
  <div className="space-y-12">
    {/* Public Articles */}
    <Section title="Public Articles" color="bg- text-green-100">
      {publicArticles.map(article => (
        <ArticleCard key={article.id} article={article} preview />
      ))}
    </Section>

    {/* Your Purchased Articles */}
    <Section title="Your Purchased Articles" color="bg-blue-800 text-blue-100">
      {ownedArticles.map(article => (
        <ArticleCard key={article.id} article={article} preview />
      ))}
    </Section>

    {/* Premium Articles */}
    <Section title="Premium Articles" color="bg-red-800 text-red-100">
      {lockedArticles.map(article => (
        <ArticleCard
          key={article.id}
          article={article}
          locked
          onPurchase={handlePurchase}
          purchasing={purchasingId === article.id}
        />
      ))}
    </Section>
  </div>
</div>

  )
}

/* UI Components */

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className={`grid gap-4 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] ${color} p-4 rounded-lg`}>
        {children}
      </div>
    </div>
  )
}
function ArticleCard({
  article,
  preview,
  locked,
  onPurchase,
  purchasing,
}: {
  article: Article;
  preview?: boolean;
  locked?: boolean;
  onPurchase?: (id: number, price: string) => void;
  purchasing?: boolean;
}) {
  const [iframeKey, setIframeKey] = useState(0);
  const reloadIframe = () => setIframeKey((prev) => prev + 1);

  return (
    <Card className="bg-gray-800 text-gray-100 shadow-lg transition-transform hover:scale-105">
      <CardHeader>
        <CardTitle className="text-white">{article.title}</CardTitle>
        <CardDescription className="text-gray-400">
          IPFS: {article.ipfsHash}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Preview Iframe */}
        {preview && !locked && (
          <div className="relative">
            <iframe
              key={iframeKey}
              src={`https://sapphire-known-flea-63.mypinata.cloud/ipfs/${article.ipfsHash}`}
              className="w-full h-40 border border-gray-700 rounded bg-gray-900"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 text-gray-100 border-gray-400"
              onClick={reloadIframe}
            >
              Reload
            </Button>
          </div>
        )}

        {/* Locked Overlay */}
        {locked && (
          <div className="w-full h-40 flex items-center justify-center bg-gray-700 text-gray-300 rounded">
            Pay to unlock this article
          </div>
        )}

        {/* Author HoverCard */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="link"
              className="p-0 text-blue-400 hover:underline"
            >
              {article.author.slice(0, 6)}...{article.author.slice(-4)}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 bg-gray-800 text-gray-100 border border-gray-700">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>
                  {article.author.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p>{article.author}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Published on-chain</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </CardContent>

      {/* Footer Button */}
      <CardFooter className="flex flex-col gap-2">
        {!locked ? (
          <Button
            onClick={() =>
              window.open(
                `https://sapphire-known-flea-63.mypinata.cloud/ipfs/${article.ipfsHash}`,
                "_blank"
              )
            }
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
          >
            Read Full
          </Button>
        ) : (
          <Button
            onClick={() => onPurchase?.(article.id, article.price)}
            disabled={purchasing}
            className="w-full bg-red-600 text-white hover:bg-red-500"
          >
            {purchasing ? "Processing..." : `Pay ${article.price} ETH`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
