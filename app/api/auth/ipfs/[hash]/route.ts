import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { hash: string } }) {
  const { hash } = params

  try {
    // Pick your preferred IPFS gateway
    const gatewayUrl = `https://sapphire-known-flea-63.mypinata.cloud/ipfs/{hash}`

    const res = await fetch(gatewayUrl)
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from IPFS" }, { status: res.status })
    }

    const text = await res.text()

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain", // keep raw markdown
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
