import { createThirdwebClient, defineChain } from "thirdweb";
import { createThirdwebConfig } from "thirdweb/react";

export const chain = defineChain(8453); // Base mainnet

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

export const thirdwebConfig = createThirdwebConfig({
  client,
  chains: [chain],
});
