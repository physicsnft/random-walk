// src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WagmiConfig, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { config } from "./wagmi.ts";

import "./index.css";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
      <App />
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>
);
