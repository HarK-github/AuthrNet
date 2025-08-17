"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { getArticleDetails } from "@/app/utils/readArticle"

export default function ReadPage() {
  const { id } = useParams()
  const { address } = useAccount()
  const [iframeSrc, setIframeSrc] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !address) return
    ;(async () => {
      try {
        setLoading(true)

        // Get article details from blockchain
        const {price,publisher,title,ipfsHash} = await getArticleDetails(Number(id), address)

        // Just build iframe URL (Pinata, Cloudflare, ipfs.io, etc.)
        setIframeSrc(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
      } catch (err) {
        console.error("Error loading article:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, address])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-300">Loading article...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-screen">
      <iframe
        src={iframeSrc}
        className="w-full h-full border-0"
        title="Article Viewer"
      />
    </div>
  )
}
