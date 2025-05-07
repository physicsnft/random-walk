// src/utils/uploadToIPFS.ts
import { NFTStorage, File } from 'nft.storage'

const NFT_STORAGE_TOKEN = 'a54a0191.e2a1ad8edc024240bec46dab018d2431'

const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

export async function uploadImageAndMetadata(blob: Blob) {
  const metadata = await client.store({
    name: 'Random Walk NFT',
    description: 'Generated random walk NFT',
    image: new File([blob], 'random-walk.png', { type: 'image/png' }),
  })

  return metadata.url // returns ipfs://... URI
}
