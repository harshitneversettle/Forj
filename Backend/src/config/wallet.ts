import { Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export function getWallet() {
  const admin = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.PVT_KEY!)),
  );
  return new anchor.Wallet(admin);
}
