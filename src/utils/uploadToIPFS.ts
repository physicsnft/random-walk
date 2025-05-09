// src/utils/uploadToIPFS.ts
import { ThirdwebStorage } from "@thirdweb-dev/storage";

const storage = new ThirdwebStorage({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  secretKey: import.meta.env.VITE_THIRDWEB_SECRET_KEY,
});

export async function uploadImageAndMetadata(blob: Blob): Promise<string> {
  try {
    // Use a File directly instead of Buffer
    const file = new File([blob], "walk.png", { type: "image/png" });

    // Upload image to IPFS
    const imageUri = await storage.upload(file, {
      uploadWithGatewayUrl: true,
      uploadWithoutDirectory: true,
    });

    // Create metadata
    const metadata = {
      name: "Random Walk NFT",
      description: "A unique generative art piece.",
      image: imageUri,
    };

    const metadataUri = await storage.upload(metadata);
    console.log("Uploaded metadata:", metadataUri);

    return metadataUri;
  } catch (err) {
    console.error("Failed to upload to Thirdweb storage:", err);
    throw err;
  }
}
