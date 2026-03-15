import { Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

const admin = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.PVT_KEY!)),
);
export const wallet = new anchor.Wallet(admin);
