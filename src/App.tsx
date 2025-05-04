import React, { useEffect, useRef, useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';
import { abi as contractAbi } from './abi'; // ABI as abi.ts

type Point = { x: number; y: number };

const CANVAS_SIZE = 400;
const STEPS = 2000;
const CONTRACT_ADDRESS = '0xDCf417A8416CA83d20652987f04c5341223dd9f1';

const mintNFT = async () => {
  try {
    const provider = (window as any).ethereum;

    if (!provider || !provider.isFarcasterSigner) {
      alert('Farcaster wallet not available');
      return;
    }

    const client = createWalletClient({
      chain: base,
      transport: custom(provider),
    });

    const [account] = await client.getAddresses();

    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'mintTo', // or your function name
      args: [account],        // depends on your contract, this is for Thirdweb-style
      account,
    });

    alert(`Minted! Transaction Hash: ${txHash}`);
  } catch (err: any) {
    console.error('Mint failed:', err);
    alert('Minting failed: ' + err.message);
  }
};


const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [hueOffset, setHueOffset] = useState(Math.floor(Math.random() * 360));

  // Generate a new random walk
  const generateRandomWalk = () => {
    const path: Point[] = [];
    let x = CANVAS_SIZE / 2;
    let y = CANVAS_SIZE / 2;
    let scale = 2;
    for (let i = 0; i < STEPS; i++) {
      const angle = Math.random() * 2 * Math.PI;
      x += scale * Math.cos(angle) * 2;
      y += scale * Math.sin(angle) * 2;
      path.push({ x, y });
    }
    setHueOffset(Math.floor(Math.random() * 360));
    setPoints(path);
  };

  // Animate the walk
  useEffect(() => {
    if (!points.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const stepsPerFrame = 20;
    let stepIndex = 0;

    function draw() {
      for (let i = 0; i < stepsPerFrame && stepIndex < points.length - 1; i++) {
        const p1 = points[stepIndex];
        const p2 = points[stepIndex + 1];

        const hue = (stepIndex / points.length) * 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        stepIndex++;
      }

      if (stepIndex < points.length - 1) {
        requestAnimationFrame(draw);
      }
    }

    draw();
  }, [points, hueOffset]);

  return (
    <div className="container">
      <canvas
        ref={canvasRef}
        id="walkCanvas"
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
      ></canvas>
      <div>
        <button onClick={generateRandomWalk}>Generate</button>
        <button onClick={mintNFT}>Mint</button>
      </div>
    </div>
  );
};

export default App;
