"use client";

import * as React from "react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { uploadToPinata } from "@/app/utils/uploadToPinata";
import { publishArticle } from "@/app/utils/deployArticle";

export default function UploadArticlePage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isPaywalled, setIsPaywalled] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorLink, setAuthorLink] = useState("");
  const [progress, setProgress] = useState(0);
  const [ipfsId, setIpfsId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [price, setPrice] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setIpfsId(null);
    setTxHash(null);
    setArticleId(null);
    setError(null);

    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        setFile(null);
        setFileUrl(null);
        return;
      }
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setFileUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file || (isPaywalled && !price)) return;

    setIsUploading(true);
    setProgress(10);
    setError(null);

    try {
      // Upload to IPFS
      const cid = await uploadToPinata(file);
      setProgress(50);
      setIpfsId(cid);

      // Publish on-chain
      const { articleId, txHash } = await publishArticle(
        file.name,
        cid,
        isPaywalled ? price : "0"
      );

      setProgress(100);
      setArticleId(articleId);
      setTxHash(txHash);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const etherscanBase = "https://sepolia.etherscan.io/tx/";
console.log("Contract Address in use:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-6 bg-gray-950 min-h-screen text-gray-100">
      {/* Upload Form */}
      <Card className="w-full max-w-xl bg-gray-900 border border-[#2c2c2c] shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-100">Upload New Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="file" className="text-gray-300">PDF File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1 bg-gray-990 border-[#3c3c3c] text-gray-200"
            />
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
          </div>

          {/* Author Info */}
          <div>
            <Label htmlFor="authorName" className="text-gray-300">Author Name (optional)</Label>
            <Input
              id="authorName"
              type="text"
              placeholder="e.g. Jane Doe"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="mt-1 bg-gray-990 border-[#3c3c3c] text-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="authorLink" className="text-gray-300">Author Link (optional)</Label>
            <Input
              id="authorLink"
              type="url"
              placeholder="https://example.com"
              value={authorLink}
              onChange={(e) => setAuthorLink(e.target.value)}
              className="mt-1 bg-gray-990 border-[#3c3c3c] text-gray-200"
            />
          </div>

          {/* Paywall Switch */}
          <div className="flex items-center gap-4">
            <Label htmlFor="paywall" className="text-gray-300">Set as Paywalled</Label>
            <Switch id="paywall" checked={isPaywalled} onCheckedChange={setIsPaywalled} />
          </div>

          {isPaywalled && (
            <div>
              <Label htmlFor="price" className="text-gray-300">Article Price (ETH)</Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g. 0.01"
                value={price}
                min="0"
                step="0.001"
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 bg-gray-990 border-[#3c3c3c] text-gray-200"
              />
            </div>
          )}

          {/* Progress + Status */}
          {isUploading && (
            <div className="mt-4 flex items-center gap-2">
              <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {ipfsId && (
            <div className="text-green-500 text-sm mt-2 truncate">
              ✅ Uploaded to IPFS: <code>{ipfsId}</code>
            </div>
          )}

          {articleId !== null && txHash && (
            <div className="text-blue-400 text-sm mt-2 space-y-1">
              🎉 Article published with ID: <strong>{articleId}</strong>
              <div className="truncate">
                View on Etherscan:{" "}
                <a
                  href={`${etherscanBase}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-300"
                >
                  {txHash}
                </a>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
            onClick={handleUpload}
            disabled={!file || isUploading || (isPaywalled && !price)}
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
            className="w-full h-[100%] border border-[#2c2c2c] rounded-md shadow bg-gray-900 "
          />
        ) : (
          <div className="w-full h-[100%] flex items-center justify-center text-gray-500 border border-dashed border-[#2c2c2c] rounded-md bg-[#1f1f1f]">
            No PDF Selected
          </div>
        )}
      </div>
    </div>
  );
}
