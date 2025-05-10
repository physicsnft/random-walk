import { useEffect, useRef, useState } from "react";
import { parseEther } from "viem";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { contract } from "../config"; 

import { isUserRejectionError } from "../lib/errors";
import { Button } from "./Button";
import { AnimatedBorder } from "./AnimatedBorder";

import { uploadImageAndMetadata } from "../utils/uploadToIPFS"; 

interface CollectButtonProps {
  timestamp?: number;
  onCollect: () => void;
  onError: (error: string | undefined) => void;
  isMinting: boolean;
}

export function CollectButton({ onCollect, onError, isMinting }: CollectButtonProps) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const [hash, setHash] = useState<`0x${string}`>();
  const [isLoadingTxData, setIsLoadingTxData] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  
  const isPending = isLoadingTxData || isConfirming;

  const successHandled = useRef(false);
  const { mutate: sendTransaction } = useSendTransaction();

  useEffect(() => {
    if (isSuccess && !successHandled.current) {
      successHandled.current = true;
      onCollect();
      setHash(undefined);
      successHandled.current = false;
    }
  }, [isSuccess, onCollect]);

const handleClick = async () => {
  try {
    if (!isMinting) {
      sdk.actions.addFrame();
      return;
    }

    setHash(undefined);
    successHandled.current = false;

    if (!isConnected || !address) {
      connect({ connector: farcasterFrame() });
      return;
    }

    // STEP 1: Get canvas and convert to image blob
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
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
        // STEP 2: Upload to IPFS
        const metadataUrl = await uploadImageAndMetadata(blob);
        console.log("Metadata uploaded:", metadataUrl);

        // STEP 3: Prepare mint transaction
        const transaction = prepareContractCall({
          contract,
          method: "function mint(address to, uint256 amount, string baseURI, bytes data) payable",
          params: [
            address,         // ✅ to
            1n,              // ✅ amount
            metadataUrl,     // ✅ baseURI
            "0x"             // ✅ data
          ],
          value: parseEther(mintMetadata.priceEth),
        });

        // STEP 4: Send the transaction
        await sendTransaction(transaction);
        console.log("✅ Mint successful");
      } catch (error) {
        if (!isUserRejectionError(error)) {
          onError(error instanceof Error ? error.message : "Something went wrong.");
        }
        setHash(undefined);
        successHandled.current = false;
        setIsLoadingTxData(false);
      }
    }, 'image/png');
    
  } catch (error) {
    onError(error instanceof Error ? error.message : "Something went wrong.");
    setHash(undefined);
    successHandled.current = false;
    setIsLoadingTxData(false);
  }
};

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="pb-4 px-4 pt-2">
        {isMinting && (
          <div className="flex justify-between items-center mb-1 text-sm">
          </div>
        )}

        {isPending ? (
          <AnimatedBorder>
            <Button className="w-full relative bg-[var(--color-active)] text-[var(--color-active-foreground)]" disabled>
              {isMinting ? "Collecting..." : "Adding..."}
            </Button>
          </AnimatedBorder>
        ) : (
          <Button className="w-full" onClick={handleClick} disabled={isPending}>
            {!isConnected && isMinting ? "Connect" : isMinting ? "Collect" : "Add Frame"}
          </Button>
        )}
      </div>
    </div>
  );
}
