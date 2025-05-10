// src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";

import App from "./App";
import { config } from "./wagmi";

import "./index.css";
import { Buffer } from "buffer";

// Thirdweb
import { ThirdwebProvider, createThirdwebClient } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";

window.Buffer = Buffer;

// Initialize clients
const queryClient = new QueryClient();
const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});
const chain = defineChain(8453); // Base mainnet

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <ThirdwebProvider client={thirdwebClient} activeChain={chain}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThirdwebProvider>
    </WagmiProvider>
  </React.StrictMode>
);
