"use client"

import React, { useEffect, useState, useMemo } from "react"
import { CalendarIcon, SearchIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import { getArticleCount, getArticleDetails, checkArticleAccess, purchaseAccess } from "@/app/utils/readArticle"
import { useRouter } from "next/navigation"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const { address: userAddress, isConnected } = useAccount()

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300) // 300ms debounce
    return () => clearTimeout(handler)
  }, [searchTerm])

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

  // Filter function (memoized for performance)
  const filterBySearch = useMemo(() => {
    return (articles: Article[]) =>
      articles.filter(
        a =>
          a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          a.author.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
  }, [debouncedSearch])

  if (!isConnected) {
    return <div className="p-10 text-center">Please connect your wallet to view articles.</div>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className = "loader"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Main Heading */}
      <h1 className="sticky text-4xl font-bold text-gray-100 mb-8">
        Articles Dashboard
      </h1>

      {/* Search bar */}
      <div className="sticky flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-800 text-white border-gray-600"
        />
        <Button variant="secondary">
          <SearchIcon className="w-4 h-4 mr-1" /> Search
        </Button>
      </div>

      {/* Article Sections */}
      <div className="space-y-12">
        {/* Public Articles */}
        <Section title="Public Articles" color="bg- text-green-100">
          {filterBySearch(publicArticles).map(article => (
            <ArticleCard key={article.id} article={article} preview />
          ))}
        </Section>

        {/* Your Purchased Articles */}
        <Section title="Your Purchased Articles" color="bg-blue-800 text-blue-100">
          {filterBySearch(ownedArticles).map(article => (
            <ArticleCard key={article.id} article={article} preview />
          ))}
        </Section>

        {/* Premium Articles */}
        <Section title="Premium Articles" color="bg-red-800 text-red-100">
          {filterBySearch(lockedArticles).map(article => (
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
 
/* Section Component */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 p-4 rounded-2xl  mb-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {React.Children.count(children) > 0 ? children : (
          <p className="text-gray-400 text-sm">No articles found.</p>
        )}
      </div>
    </div>
  )
}


/* Article Card Component */
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
  const router = useRouter();
  return (
   <Card className="bg-black text-white border border-gray-200 rounded-lg shadow-sm">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">{article.title}</CardTitle>
    <CardDescription className="text-xs text-gray-400 truncate">
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
          className="w-full h-40 border border-gray-200 rounded-md"
        />
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2"
          onClick={reloadIframe}
        >
          Reload
        </Button>
      </div>
    )}

    {/* Locked Overlay */}
    {locked && (
      <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-gray-500 rounded-md text-sm">
        Premium – Unlock to read
      </div>
    )}

    {/* Author */}
    <div className="mt-4 flex items-center space-x-3 text-sm">
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {article.author.slice(2, 4).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium truncate">{article.author}</p>
        <p className="text-gray-500">On-chain</p>
      </div>
    </div>
  </CardContent>

  {/* Footer */}
  <CardFooter>
    {!locked ? (
      <Button
        onClick={() => router.push(`/read/${article.id}`)}
        className="w-full"
      >
        Read Full
      </Button>
    ) : (
      <Button
        onClick={() => onPurchase?.(article.id, article.price)}
        disabled={purchasing}
        className="w-full"
      >
        {purchasing ? "Processing..." : `Unlock for ${article.price} ETH`}
      </Button>
    )}
  </CardFooter>
</Card>

  );
}
