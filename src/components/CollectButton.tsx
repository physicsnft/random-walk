import { useState } from "react";
import {
  useAccount,
  useConnect,
  useWalletClient,
  useWriteContract,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { parseEther } from "viem";
import type { Log } from "viem";
//import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { contractConfig } from "../config";
import { uploadImageAndMetadata } from "../utils/uploadToIPFS";
import { Button } from "./Button";
import { AnimatedBorder } from "./AnimatedBorder";
import { isUserRejectionError } from "../lib/errors";
import { injected } from "wagmi/connectors";

type Address = `0x${string}`;

interface CollectButtonProps {
  onCollect: () => void;
  onError: (error: string | undefined) => void;
  isMinting: boolean;
}

export function CollectButton({ onCollect, onError, isMinting }: CollectButtonProps) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [isLoadingTxData, setIsLoadingTxData] = useState(false);
  const isPending = isLoadingTxData;

  const contractAddress: Address = contractConfig.address as Address;

  const { data: totalMinted } = useReadContract({
    address: contractAddress,
    abi: contractConfig.abi,
    functionName: "totalSupply",
  });

  const { data: mintedByMe } = useReadContract({
    address: contractAddress,
    abi: contractConfig.abi,
    functionName: "mintedPerAddress",
    args: address ? [address as Address] : [],
  });

  const mintLimitReached =
    Number(totalMinted) >= 1000 || Number(mintedByMe) >= 10;

  const handleClick = async () => {
    try {
      if (!isMinting) return;

      if (!isConnected || !address) {
        //connect({ connector: farcasterFrame() });
        connect({ connector: injected() });
        return;
      }
      
      function ConnectTest() {
        const { connect } = useConnect();

        return (
          <button onClick={() => connect({ connector: injected() })}>
            Connect MetaMask
          </button>
        );
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


          console.log("address:", address);
          console.log("walletClient:", walletClient);
          console.log("publicClient:", publicClient);
          
          const txHash = await writeContractAsync({
            address: contractAddress,
            abi: contractConfig.abi,
            functionName: "safeMint",
            args: [address as Address, metadataUrl],
            value: parseEther("0.001"),
          });
          
          console.log("txHash returned:", txHash);
          const found = await publicClient.getTransaction({ hash: txHash });
          console.log("Was transaction found?", found);

          console.log("✅ Mint sent. Waiting for confirmation...");
          
          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

          const transferLog = receipt.logs.find(
            (log: Log) =>
              log.topics?.[0] ===
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
          );

          if (transferLog && transferLog.topics.length === 4) {
            const tokenIdHex = transferLog.topics[3];
            const tokenId = BigInt(tokenIdHex).toString();

            const baseUrl = "https://sepiola.basescan.org"; // Change this if using another network
            const nftUrl = `${baseUrl}/token/${contractAddress}?a=${tokenId}`;
            console.log(`✅ View NFT: ${nftUrl}`);
          }

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
            Minting limit reached — try again later!
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
