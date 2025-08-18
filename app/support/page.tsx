"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { fetchAllAuthors, supportAuthor, Author } from "@/app/utils/supportArticle";
import { useAccount } from "wagmi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SupportAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isSupporting, setIsSupporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address: userAddress } = useAccount();

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

  useEffect(() => {
    async function fetchAuthors() {
      const data = await fetchAllAuthors(CONTRACT_ADDRESS);
      setAuthors(data);
    }
    fetchAuthors();
  }, []);

  const handleSupport = async () => {
    if (!selectedAuthor || !amount) return;

    setIsSupporting(true);
    setProgress(10);
    setTxHash(null);

    try {
      const txHash = await supportAuthor(selectedAuthor, amount,CONTRACT_ADDRESS);
  setProgress(100);
  setTxHash(txHash); 
    } catch (err) {
      console.error("Support failed:", err);
      setProgress(0);
    } finally {
      setIsSupporting(false);
    }
  };

  return (
    <div className="p-6 flex flex-col lg:flex-row gap-8 items-start bg-gray-950 min-h-screen text-gray-100">
      {/* Authors Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authors.length === 0 ? (
            <div className="text-gray-500 col-span-full">No authors found.</div>
          ) : (
            authors.map((author) => (
              <Card
                key={author.address}
                className="bg-gray-900 border border-gray-800 text-gray-100 shadow-sm h-[120px] flex flex-col justify-center"
              >
                <CardContent className="space-y-2">
                  <div className="font-mono text-xs truncate text-gray-300">
                    {author.address}
                  </div>
                  <div className="text-gray-400 text-sm">{author.articleCount} articles</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Chart */}
        {authors.length > 0 && (
          <Card className="bg-gray-900 border border-gray-800 text-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-100 text-lg font-semibold">
                Articles Published
              </CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={authors}>
                  <XAxis
                    dataKey="address"
                    tick={{ fill: "#aaa", fontSize: 11 }}
                    tickFormatter={(addr) => addr.slice(0, 6) + "..." + addr.slice(-4)}
                  />
                  <YAxis tick={{ fill: "#aaa", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "1px solid #333",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#ccc" }}
                  />
                  <Bar dataKey="articleCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Support Form */}
      <Card className="w-full max-w-md bg-gray-900 border border-gray-800 text-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Support an Author</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-400 text-sm">Select Author</label>
            <select
              className="w-full border border-gray-700 bg-gray-800 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 text-sm"
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
            >
              <option value="">-- Choose an author --</option>
              {authors.map((author) => (
                <option key={author.address} value={author.address}>
                  {author.address.slice(0, 6)}...{author.address.slice(-4)} ({author.articleCount})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-400 text-sm">Amount (ETH)</label>
            <Input
              type="number"
              placeholder="0.01"
              value={amount}
              min="0"
              step="0.001"
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-200 text-sm"
            />
          </div>

          {isSupporting && (
            <div className="mt-4 flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4 text-blue-500" />
              <Progress value={progress} className="w-full h-2" />
            </div>
          )}

          {txHash && (
            <div className="text-green-500 text-xs mt-2">
              🎉 Supported successfully! Tx:{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400"
              >
                {txHash.slice(0, 10)}...
              </a>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className={`w-full h-9 text-sm transition-colors duration-200 ${
              selectedAuthor &&
              userAddress &&
              selectedAuthor.toLowerCase() === userAddress.toLowerCase()
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
            onClick={handleSupport}
            disabled={!selectedAuthor || !amount || isSupporting}
          >
            {isSupporting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Supporting...
              </div>
            ) : selectedAuthor &&
              userAddress &&
              selectedAuthor.toLowerCase() === userAddress.toLowerCase() ? (
              "You cannot support yourself"
            ) : (
              "Support Author"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
