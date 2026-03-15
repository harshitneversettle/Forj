import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { connection } from "./connection";
import * as anchor from "@coral-xyz/anchor";
import { wallet } from "./wallet";
import idl from "../idl.json";

const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);
export const program = new Program(idl as anchor.Idl, provider);
