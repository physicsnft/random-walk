// src/utils/uploadToIPFS.ts
import { NFTStorage, File } from 'nft.storage'
console.log("Token preview:", import.meta.env.VITE_NFT_STORAGE_TOKEN?.slice(0, 6));
const client = new NFTStorage({ token: import.meta.env.VITE_NFT_STORAGE_TOKEN });

export async function uploadImageAndMetadata(blob: Blob) {
  const metadata = await client.store({
    name: 'Random Walk NFT',
    description: 'Generated random walk NFT',
    image: new File([blob], 'random-walk.png', { type: 'image/png' }),
  })

  return metadata.url // returns ipfs://... URI
}
