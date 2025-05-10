import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useConnect } from "wagmi";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { contract } from "../config";

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

  const [isLoadingTxData, setIsLoadingTxData] = useState(false);
  const isPending = isLoadingTxData;

  const { mutate: sendTransaction } = useSendTransaction({
    onSuccess: (txResult) => {
      console.log("✅ Mint transaction sent!", txResult);
      onCollect();
      setIsLoadingTxData(false);
    },
    onError: (err) => {
      console.error("❌ Mint failed:", err);
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (!isUserRejectionError(err)) {
        onError(msg);
      }
      setIsLoadingTxData(false);
    },
  });

  const handleClick = async () => {
    try {
      if (!isMinting) return;

      if (!isConnected || !address) {
        connect({ connector: farcasterFrame() });
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
          console.log("Metadata uploaded:", metadataUrl);

          const transaction = prepareContractCall({
            contract,
            method: "function mint(address to, uint256 amount, string baseURI, bytes data) payable",
            params: [address, 1n, metadataUrl, "0x"],
            value: parseEther("0.001"), // Replace with your actual mint price
          });

          sendTransaction(transaction); // no await
        } catch (err) {
          console.error("❌ Upload or transaction setup failed:", err);
          onError("Something went wrong before sending transaction.");
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
        {isPending ? (
          <AnimatedBorder>
            <Button className="w-full relative bg-[var(--color-active)] text-[var(--color-active-foreground)]" disabled>
              {isMinting ? "Collecting..." : "Processing..."}
            </Button>
          </AnimatedBorder>
        ) : (
          <Button className="w-full" onClick={handleClick} disabled={isPending}>
            {!isConnected && isMinting ? "Connect Wallet" : isMinting ? "Collect" : "Unavailable"}
          </Button>
        )}
      </div>
    </div>
  );
}
