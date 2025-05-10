import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

import { WagmiProvider } from "wagmi";
import { config as wagmiConfig } from "./wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Buffer } from "buffer";
window.Buffer = Buffer;
 
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <ThirdwebProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThirdwebProvider>
    </WagmiProvider>
  </React.StrictMode>
);
