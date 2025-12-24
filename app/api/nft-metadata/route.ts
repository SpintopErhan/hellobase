// app/api/nft-metadata/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "HelloBase Early Supporter",
    description: "The first NFT collection minted on the HelloBase Mini App.",
    image: "https://hellobase.vercel.app/nft-image.png", // Resmin tam linki
    external_url: "https://hellobase.vercel.app",
    attributes: [
      { "trait_type": "Platform", "value": "Baseapp" },
      { "trait_type": "Network", "value": "Base Sepolia" },
      { "trait_type": "Type", "value": "Early Adopter" }
    ]
  });
}