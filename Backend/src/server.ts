import express from "express";
import cors from "cors";
import multer from "multer";
import crypto from "crypto";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";
import MerkleTree, { MerkleMountainRange } from "merkletreejs";
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN, web3 } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "./idl.json";
import { constants } from "buffer";
import stream, { Readable } from "stream";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import axios, { all } from "axios";
import { student } from "./types";
import buildMerkleTreeAndProofs from "./helpers/merkle_stuff";
import process_file from "./helpers/process_files";
import upload_route from "./routes/upload_route"
dotenv.config();
let app = express();

app.use(express.json());

const admin = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.PVT_KEY!)),
);
const connection = new Connection(
  "https://devnet.helius-rpc.com/?api-key=734f5c9d-1802-48ab-ab39-4d2c80f8dd6e",
  "confirmed",
);

const wallet = new anchor.Wallet(admin);
const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const programId = new PublicKey("EtaqN8Lz1J1zdoJRXapCNudMDKaWyxcGtapi6eWjnGfC");
const program = new Program(idl as anchor.Idl, provider);


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/ping", (req, res) => {
  res.send("pong");
});


app.use("/api/upload" , upload_route)
app.post("/api/claim", async (req, res) => {
  const issuer = req.body.pubkey;
  const issuerPubkey = new PublicKey(issuer!);
  const uniqueKey = req.body.uniqueKey;
  const studentEmail = req.body.userEmail;
  const [eventPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("event"),
      issuerPubkey!.toBuffer(),
      new BN(Number(uniqueKey)).toArrayLike(Buffer, "le", 8),
    ],
    programId,
  );
  console.log(eventPda.toBase58());
  const eventState = await (program.account as any).event.fetch(eventPda);
  const metadataUrl = eventState.metadataUri;
  const templateUri = eventState.templateUri;
  const result = await fetch(metadataUrl);
  const eventName = eventState.eventName;
  const data = await result.json();
  let ans_name;
  let ans_enroll;
  let ans_email;
  let ans_position;
  let ans_eventName = eventName;
  //console.log(studentEmail)
  let verifyUrl = `http://localhost:5173/verify/${issuer}/${uniqueKey}/${studentEmail}`;
  console.log(verifyUrl);
  (data as []).find((i: any) => {
    let currEmail = i.email;
    if (currEmail === studentEmail) {
      ans_name = i.name;
      ans_enroll = i.enroll || null;
      ans_email = i.email || null;
      ans_position = i.position || null;
    }
  });

  const response = {
    ans_name,
    ans_enroll,
    ans_email,
    ans_position,
    ans_eventName,
    templateUri,
    eventName,
    verifyUrl,
  };
  //console.log(`http://localhost:5173/verify/${issuer}/${uniqueKey}`);
  if (
    ans_name === undefined ||
    ans_enroll === undefined ||
    ans_name === "" ||
    ans_enroll === ""
  ) {
    res.status(400).send("error");
  } else {
    res.json(response);
  }
});

app.post("/api/generate-certificate", async (req, res) => {
  const { templateUri, ...data } = req.body;
  console.log(data);
  const response = await axios.get(templateUri, {
    responseType: "arraybuffer",
  });
  const certificate = await PDFDocument.load(response.data);
  const form = certificate.getForm();

  Object.entries(data).forEach(([key, val]) => {
    try {
      form.getTextField(key).setText(val as string);
    } catch {}
  });
  form.flatten();
  const pdfBytes = await certificate.save();
  res.send(Buffer.from(pdfBytes));
});

app.post("/api/verify", async (req, res) => {
  try {
    const { issuer, uniqueKey, email } = req.body;
    const issuerPubkey = new PublicKey(issuer!);
    //console.log(issuerPubkey.toBase58());
    const [eventPda, bump] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"),
        issuerPubkey.toBuffer(),
        new BN(Number(uniqueKey)).toArrayLike(Buffer, "le", 8),
      ],
      programId,
    );
    //console.log(eventPda.toString());
    const eventState = await (program.account as any).event.fetch(eventPda);
    const dataUrl = eventState.metadataUri;
    const merkleProofUrl = eventState.merkleProofUri;
    const merkleRoot = Buffer.from(
      eventState.merkleRoot.buffer || eventState.merkleRoot,
    );
    //console.log(merkleProofUri);
    const result1 = await fetch(merkleProofUrl);
    const merkleProof = await result1.json();
    const result2 = await fetch(dataUrl);
    const studentData = await result2.json();
    //console.log(studentData);
    let result_name;
    let result_enroll;
    let result_email;
    let result_position;
    let student: any = null;
    let corress_idx = -1;
    (studentData as []).forEach((i: any, index: number) => {
      if (i.email === email) {
        student = {
          email: i.email,
          enroll: i.enroll,
          name: i.name,
          position: i.position,
        };
        corress_idx = index;
      }
    });
    //console.log(corress_idx);
    const stringify = JSON.stringify(student, Object.keys(student));
    let leafHash = crypto.createHash("sha256").update(stringify).digest();
    const proof = (merkleProof as [])[corress_idx] as any[];
    for (const i of proof) {
      const cleanHex = i.toString().startsWith("0x") ? i.slice(2) : i;
      const proofBuffer = Buffer.from(cleanHex, "hex");
      if (leafHash.compare(proofBuffer) < 0) {
        leafHash = crypto
          .createHash("sha256")
          .update(Buffer.concat([leafHash, proofBuffer]))
          .digest();
      } else {
        leafHash = crypto
          .createHash("sha256")
          .update(Buffer.concat([proofBuffer, leafHash]))
          .digest();
      }
    }
    console.log(
      "Expected root:",
      Buffer.from(eventState.merkleRoot).toString("hex"),
    );
    const verified = leafHash.equals(merkleRoot);
    console.log(verified);
    res.send(verified);
  } catch (error) {
    console.log("lol");
    res.send("lol");
  }
});

app.listen(3001, () => {
  console.log(`Server running on http://localhost:${3001}`);
});
