"use client"

import * as React from "react"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { uploadToPinata } from "../utils/uploadToPinata"
import { publishArticle } from "@/app/utils/deployArticle" // updated import

export default function UploadArticlePage() {
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isPaywalled, setIsPaywalled] = useState(false)
  const [authorName, setAuthorName] = useState("")
  const [authorLink, setAuthorLink] = useState("")
  const [progress, setProgress] = useState(0)
  const [ipfsId, setIpfsId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [price, setPrice] = useState("")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [articleId, setArticleId] = useState<number | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setIpfsId(null)
    setTxHash(null)
    setArticleId(null)

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setFileUrl(url)
    } else {
      setFileUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!file || (isPaywalled && !price)) return
    setIsUploading(true)
    setProgress(10)

    try {
      // 1. Upload file to IPFS
      const cid = await uploadToPinata(file)
      setProgress(50)
      setIpfsId(cid)

      // 2. Publish to blockchain
      const { articleId, txHash } = await publishArticle(
        file.name,
        cid,
        isPaywalled ? price : "0"
      )

      setProgress(100)
      setArticleId(articleId)
      setTxHash(txHash)
    } catch (err) {
      console.error("Upload failed:", err)
      setProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const etherscanBase = "https://sepolia.etherscan.io/tx/" // change if using another testnet

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6">
      {/* Upload Form Card */}
      <Card className="w-full max-w-xl bg-[#eee8d5] shadow-md">
        <CardHeader>
          <CardTitle>Upload New Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file">PDF File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="authorName">Author Name (optional)</Label>
            <Input
              id="authorName"
              type="text"
              placeholder="e.g. Jane Doe"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="authorLink">Author Link (optional)</Label>
            <Input
              id="authorLink"
              type="url"
              placeholder="https://example.com"
              value={authorLink}
              onChange={(e) => setAuthorLink(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="paywall">Set as Paywalled</Label>
            <Switch id="paywall" checked={isPaywalled} onCheckedChange={setIsPaywalled} />
          </div>

          {isPaywalled && (
            <div>
              <Label htmlFor="price">Article Price (in ETH)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 0.01"
                value={price}
                min="0"
                step="0.001"
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          {isUploading && (
            <div className="mt-4 flex items-center gap-2">
              <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {ipfsId && (
            <div className="text-green-700 text-sm space-y-1">
              ✅ Uploaded to IPFS: <code>{ipfsId}</code>
            </div>
          )}

          {articleId !== null && txHash && (
            <div className="text-blue-700 text-sm space-y-1">
              🎉 Article published with ID: <strong>{articleId}</strong>
              <div>
                View on Etherscan:{" "}
                <a
                  href={`${etherscanBase}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {txHash.slice(0, 10)}...
                </a>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-[#268bd2] text-[#fdf6e3] hover:bg-[#2aa198]"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Publishing...
              </div>
            ) : (
              "Upload to Contract"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* PDF Preview */}
      <div className="w-full flex-1">
        {fileUrl ? (
          <iframe
            src={fileUrl}
            className="w-full h-[600px] border border-gray-300 rounded-md shadow"
          />
        ) : (
          <div className="w-full h-[600px] flex items-center justify-center text-gray-500 border border-dashed border-gray-300 rounded-md">
            No PDF Selected
          </div>
        )}
      </div>
    </div>
  )
}
