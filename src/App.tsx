import { useRef, useState, useEffect } from 'react';
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';
import { abi as contractAbi } from './abi'; // ABI as abi.ts
import { sdk } from '@farcaster/frame-sdk';
import { CollectButton } from "./components/CollectButton";

type Point = { x: number; y: number };

const CANVAS_SIZE = 300;
const STEPS = 2000;
const CONTRACT_ADDRESS = '0xDCf417A8416CA83d20652987f04c5341223dd9f1';

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [hueOffset, setHueOffset] = useState(Math.floor(Math.random() * 360));
  
  
  useEffect(() => {
    (async () => {
        await sdk.actions.ready();
    })();
  }, []);

  // Generate a new random walk
  const generateRandomWalk = () => {
    const path: Point[] = [];
    let x = CANVAS_SIZE / 2;
    let y = CANVAS_SIZE / 2;
    let scale = 1;
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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!ctx) return;

    const stepsPerFrame = 20;
    let stepIndex = 0;

    function draw() {
      for (let i = 0; i < stepsPerFrame && stepIndex < points.length - 1; i++) {
        const p1 = points[stepIndex];
        const p2 = points[stepIndex + 1];

        const hue = (stepIndex / points.length) * 360;
        if (!ctx) return;
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
      <div className="button-row">
        <button onClick={generateRandomWalk} className="app-button">
          Generate
        </button>
        <CollectButton
          isMinting={true}
          onCollect={() => console.log("Mint successful")}
          onError={(err: unknown) => console.error("Mint failed", err)}
        />
      </div>
    </div>
  );
};

export default App;
