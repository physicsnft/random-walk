// src/utils/uploadToIPFS.ts
import { NFTStorage, File } from 'nft.storage'

const client = new NFTStorage({ token: import.meta.env.VITE_NFT_STORAGE_TOKEN,});

export async function uploadImageAndMetadata(blob: Blob) {
  const metadata = await client.store({
    name: 'Random Walk NFT',
    description: 'Generated random walk NFT',
    image: new File([blob], 'random-walk.png', { type: 'image/png' }),
  })

  return metadata.url // returns ipfs://... URI
}
