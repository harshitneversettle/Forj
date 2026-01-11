import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Forj } from "../target/types/forj";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import fs from "fs";

describe("forj", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.forj as Program<Forj>;
  const admin = Keypair.fromSecretKey(
    Uint8Array.from(
      JSON.parse(fs.readFileSync("/home/titan/Desktop/forj/admin.json", "utf8"))
    )
  );

  it("Register the data -> ", async () => {
    let uniqueKey = 1104;
    const [eventPda, eventBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"), 
        admin.publicKey.toBuffer(), 
        new anchor.BN(uniqueKey).toArrayLike(
          Buffer,
          "le",
          8 
        ),
      ],
      program.programId
    );
    let eventstate =await program.account.event.fetch(eventPda) ;
    console.log(eventstate.metadataUri) ;
    console.log(eventstate.merkleRoot);
  });
});
