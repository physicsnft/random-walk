import { useState } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useConnect,
  useWalletClient,
  useWriteContract,
  useReadContract,
} from "wagmi";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { contractConfig } from "../config";

import { isUserRejectionError } from "../lib/errors";
import { Button } from "./Button";
import { AnimatedBorder } from "./AnimatedBorder";
import { uploadImageAndMetadata } from "../utils/uploadToIPFS";

interface CollectButtonProps {
  onCollect: () => void;
  onError: (error: string | undefined) => void;
  isMinting: boolean;
}

export function CollectButton({ onCollect, onError, isMinting }: CollectButtonProps) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();

  const [isLoadingTxData, setIsLoadingTxData] = useState(false);
  const isPending = isLoadingTxData;

  // ✅ Read total supply
  const { data: totalMinted } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: "totalSupply",
  });

  // ✅ Read number minted by current address
  const { data: mintedByMe } = useReadContract({
    address: contractConfig.address,
    abi: contractConfig.abi,
    functionName: "mintedPerAddress",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const mintLimitReached =
    Number(totalMinted) >= 1000 || Number(mintedByMe) >= 10;

  const handleClick = async () => {
    try {
      if (!isMinting) return;

      if (!isConnected || !address) {
        connect({ connector: farcasterFrame() });
        return;
      }

      if (!walletClient) {
        onError("Wallet client not available.");
        return;
      }

      const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
      if (!canvas) {
        onError("Canvas not found.");
        return;
      }

      setIsLoadingTxData(true);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          onError("Failed to get canvas image.");
          setIsLoadingTxData(false);
          return;
        }

        try {
          const metadataUrl = await uploadImageAndMetadata(blob);
          console.log("✅ Metadata uploaded:", metadataUrl);

          const tx = await writeContractAsync({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: "safeMint",
            args: [address, metadataUrl],
            value: parseEther("0.001"),
          });

          console.log("✅ Mint sent:", tx);
          onCollect();
        } catch (err: unknown) {
          console.error("❌ Mint failed:", err);
          const msg = err instanceof Error ? err.message : "Transaction failed";
          if (!isUserRejectionError(err)) {
            onError(msg);
          }
        } finally {
          setIsLoadingTxData(false);
        }
      }, "image/png");
    } catch (err) {
      onError("Something unexpected went wrong.");
      setIsLoadingTxData(false);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="pb-4 px-4 pt-2">
        {mintLimitReached && (
          <p className="text-sm text-center text-red-500 mb-2">
            Minting limit reached. Follow me to know when the next mint starts!
          </p>
        )}

        {isPending ? (
          <AnimatedBorder>
            <Button
              className="w-full relative bg-[var(--color-active)] text-[var(--color-active-foreground)]"
              disabled
            >
              {isMinting ? "Collecting..." : "Processing..."}
            </Button>
          </AnimatedBorder>
        ) : (
          <Button
            className="w-full"
            onClick={handleClick}
            disabled={isPending || mintLimitReached}
          >
            {mintLimitReached
              ? "Limit Reached"
              : !isConnected && isMinting
              ? "Connect Wallet"
              : isMinting
              ? "Collect"
              : "Unavailable"}
          </Button>
        )}
      </div>
    </div>
  );
}
