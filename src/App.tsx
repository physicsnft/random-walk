import { useRef, useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { CollectButton, ConnectTest, setHasMintedCurrentArtwork } from "./components/CollectButton";
import { Button } from "./components/Button";
import { AnimatedBorder } from "./components/AnimatedBorder";

type Point = { x: number; y: number };

const CANVAS_SIZE = 300;
const STEPS = 2000;

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [hueOffset, setHueOffset] = useState(Math.floor(Math.random() * 360));
  const [hasMintedCurrentArtwork, setHasMintedCurrentArtwork] = useState(false);
  
  useEffect(() => {
    (async () => {
        await sdk.actions.ready();
    })();
  }, []);

  // Generate a new random walk
  const generateRandomWalk = () => {
    setHasMintedCurrentArtwork(false);
    
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
  
  // call it once the app is opened
  useEffect(() => {
    generateRandomWalk();
  }, []);

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
  <div className="w-full max-w-sm flex flex-col">
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="border border-gray-300 rounded shadow bg-white"
    />
    
    <div className="bg-card p-4">
    <div className="bg-card p-2">
      <div className="w-full max-w-md mx-auto">
        <Button onClick={generateRandomWalk} className="w-full">
          Generate
        </Button>
      </div>
      </div>

      <CollectButton
        isMinting={true}
        onCollect={() => {
          console.log("Mint successful");
          setHasMintedCurrentArtwork(true);
        }}
        onError={(err) => console.error("Mint failed", err)}
        hasMintedCurrentArtwork={hasMintedCurrentArtwork}
        setHasMintedCurrentArtwork={setHasMintedCurrentArtwork}
      />
    </div>
  </div>

  );
};

export default App;
