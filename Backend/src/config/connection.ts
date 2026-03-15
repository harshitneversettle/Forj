import { Connection } from "@solana/web3.js";

export const connection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=734f5c9d-1802-48ab-ab39-4d2c80f8dd6e",
  "confirmed",
);