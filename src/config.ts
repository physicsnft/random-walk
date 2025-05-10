// src/config.ts or src/thirdweb.ts
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

import abi from "./abi"; // your ABI JSON or object

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

export const chain = defineChain(8453); // Base

export const contract = getContract({
  client,
  chain,
  address: "0xYourContractAddress",
  abi,
});
