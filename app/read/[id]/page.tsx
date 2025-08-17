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

  // ✅ Pull contract + RPC values from NEXT_PUBLIC_ env at runtime
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
  
  useEffect(() => {
    if (!id || !address) return
    ;(async () => {
      try {
        setLoading(true)

        // Pass contract & RPC explicitly
        const { ipfsHash } = await getArticleDetails(
          Number(id),
          address,
          contractAddress, 
        )

        // Choose any gateway you prefer (Pinata here)
        setIframeSrc(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
      } catch (err) {
        console.error("Error loading article:", err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, address, contractAddress])

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
