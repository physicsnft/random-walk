// src/utils/uploadToIPFS.ts

import { ThirdwebStorage } from "@thirdweb-dev/storage";

const storage = new ThirdwebStorage({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  secretKey: import.meta.env.VITE_THIRDWEB_SECRET_KEY,
});

export async function uploadImageAndMetadata(blob: Blob): Promise<string> {
  try {
    // Read blob into an ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the image file to IPFS
    const imageUri = await storage.upload(buffer, {
      uploadWithGatewayUrl: true,
      uploadWithoutDirectory: true,
    });

    // Create ERC721-compatible metadata
    const metadata = {
      name: "Random Walk NFT",
      description: "A unique generative art piece created from a random walk.",
      image: imageUri,
    };

    // Upload metadata and return its IPFS URI
    const metadataUri = await storage.upload(metadata);
    console.log("Uploaded metadata:", metadataUri);

    return metadataUri;
  } catch (err) {
    console.error("Failed to upload to Thirdweb storage:", err);
    throw err;
  }
}
