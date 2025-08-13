"use client"

import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { formatEther } from "viem"
import { config } from "@/app/config"

// New imports from our helpers
import { getArticleCount, getArticleDetails, checkArticleAccess } from "@/app/utils/readArticle"

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

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const userAddress = (await config.connector?.getAccount())?.address
        const total = await getArticleCount()

        const articles: Article[] = []

        for (let i = 0; i < total; i++) {
          const [title, ipfsHash, priceBN, author] = await getArticleDetails(i)
          const price = formatEther(priceBN)
          const hasAccess = userAddress ? await checkArticleAccess(userAddress, i) : false

          articles.push({
            id: i,
            title,
            ipfsHash,
            price,
            author,
            hasAccess,
          })
        }

        // Categorize
        setPublicArticles(articles.filter(a => a.price === "0"))
        setOwnedArticles(articles.filter(a => a.price !== "0" && a.hasAccess))
        setLockedArticles(articles.filter(a => a.price !== "0" && !a.hasAccess))
      } catch (err) {
        console.error("Error fetching articles:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) return <div className="p-10 text-center">Loading articles...</div>

  return (
    <div className="space-y-12">
      <Section title="Public Articles" color="bg-green-100">
        {publicArticles.map(article => (
          <ArticleCard key={article.id} article={article} preview />
        ))}
      </Section>

      <Section title="Your Purchased Articles" color="bg-blue-100">
        {ownedArticles.map(article => (
          <ArticleCard key={article.id} article={article} preview />
        ))}
      </Section>

      <Section title="Premium Articles" color="bg-red-100">
        {lockedArticles.map(article => (
          <ArticleCard key={article.id} article={article} locked />
        ))}
      </Section>
    </div>
  )
}

/* ========== UI Components ========== */

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

function ArticleCard({ article, preview, locked }: { article: Article; preview?: boolean; locked?: boolean }) {
  return (
    <Card className="shadow-md transition-transform hover:scale-105">
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
        <CardDescription>IPFS: {article.ipfsHash}</CardDescription>
      </CardHeader>

      <CardContent>
        {preview && (
          <iframe
            src={`https://ipfs.io/ipfs/${article.ipfsHash}`}
            className="w-full h-40 border rounded"
          />
        )}

        {locked && (
          <div className="w-full h-40 flex items-center justify-center bg-gray-200 text-gray-500">
            Pay to unlock this article
          </div>
        )}

        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link" className="p-0 text-blue-500 hover:underline">
              {article.author.slice(0, 6)}...{article.author.slice(-4)}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>{article.author.slice(2, 4).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p>{article.author}</p>
                <div className="flex items-center gap-1 text-xs">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Published on-chain</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {!locked ? (
          <Button className="w-full bg-blue-600 text-white">Read Full</Button>
        ) : (
          <Button className="w-full bg-red-600 text-white">Pay {article.price} ETH</Button>
        )}
      </CardFooter>
    </Card>
  )
}
