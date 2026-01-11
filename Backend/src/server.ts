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
import idl from "/home/titan/Desktop/forj/target/idl/forj.json";
import { constants } from "buffer";
import stream from "stream";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import axios from "axios";
import { sha256 } from "@coral-xyz/anchor/dist/cjs/utils";

let app = express();
let upload = multer();
app.use(express.json());
dotenv.config();
const admin = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.PVT_KEY!))
);
const connection = new Connection("http://127.0.0.1:8899", "confirmed");

const wallet = new anchor.Wallet(admin);
const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider);
const programId = new PublicKey("8DUw9b9nwoXH6FuqBUGy7dknzpDy1Ljh94rwKYNdEHRb");
const program = new Program(idl as anchor.Idl, provider);

interface student {
  name: string;
  enroll: string;
  email: string;
  position: string | null;
}

const pinata = new pinataSDK({ pinataJWTKey: process.env.JWT });

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post(
  "/api/upload",
  upload.fields([
    { name: "csv", maxCount: 1 },
    { name: "template", maxCount: 1 },
  ]),
  async (req, res) => {
    let eventName = req.body.eventName;
    let eventId = req.body.eventId;
    if (!req.files || Array.isArray(req.files)) {
      return res.status(400).json({ error: "Files not received correctly" });
    }
    const csvFile = req.files["csv"]?.[0];
    const templateFile = req.files["template"]?.[0];

    let file = csvFile.buffer.toString("utf8").split("\n");
    let all_students: student[] = [];

    file?.map((i) => {
      let arr = i.split(",");
      let name = arr[0];
      let enroll = arr[1];
      let email = arr[2];
      let position = arr[3] || null;
      const user: student = {
        name,
        enroll,
        email,
        position,
      };
      all_students.push(user);
    });

    // console.log(all_students);
    const result1 = await pinata.pinJSONToIPFS(all_students);
    const cid1 = result1.IpfsHash;

    const templateStream = new stream.PassThrough();
    templateStream.end(templateFile.buffer);
    const result2 = await pinata.pinFileToIPFS(templateStream, {
      pinataMetadata: {
        name: templateFile.originalname,
      },
    });
    const cid2 = result2.IpfsHash;

    const leaves = all_students.map((i) => {
      const stringify = JSON.stringify(i, Object.keys(i).sort());
      return crypto.createHash("sha256").update(stringify).digest();
    });

    const Merkle_tree = new MerkleTree(
      leaves,
      (i: any) => {
        return crypto.createHash("sha256").update(i).digest();
      },
      { sortPairs: true }
    );

    let merkleProof = all_students.map((i) => {
      const stringify = JSON.stringify(i, Object.keys(i).sort());
      const hash = crypto.createHash("sha256").update(stringify).digest();
      return Merkle_tree.getHexProof(hash);
    });
    //console.log(merkleProof);
    let result3 = await pinata.pinJSONToIPFS(merkleProof);
    let cid3 = result3.IpfsHash;

    const root = Merkle_tree.getHexRoot();
    let batchSize = all_students.length;
    const bitmapSize = Math.ceil(batchSize / 8);
    const bitMap = Buffer.alloc(bitmapSize);
    const merkleRoot = Array.from(
      Buffer.from(root.startsWith("0x") ? root.slice(2) : root, "hex")
    );
    let metadataUri = `https://gateway.pinata.cloud/ipfs/${cid1}`;
    let templateUri = `https://gateway.pinata.cloud/ipfs/${cid2}`;
    let merkleProofUri = `https://gateway.pinata.cloud/ipfs/${cid3}`;
    // console.log(merkleProofUri);
    const data = {
      uniqueKey: eventId,
      eventName,
      eventId,
      batchSize,
      bitMap,
      merkleRoot,
      metadataUri,
      templateUri,
      merkleProofUri,
    };
    res.send(data);
  }
);


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
    programId
  );
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
  let verify_url = `http://localhost:5173/verify/${issuer}/${uniqueKey}`;
  (data as []).map((i: any) => {
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
    verify_url,
  };
  console.log(`http://localhost:5173/verify/${issuer}/${uniqueKey}`);
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
  const { name, enrollment, position, eventName, templateUri, verifyUrl } =
    req.body;
  const response = await axios.get(templateUri, {
    responseType: "arraybuffer",
  });
  const certificate = await PDFDocument.load(response.data);
  const form = certificate.getForm();
  try {
    form.getTextField("name").setText(name);
  } catch {}

  try {
    form.getTextField("enrollment").setText(enrollment);
  } catch {}

  try {
    form.getTextField("eventName").setText(eventName);
  } catch {}

  try {
    form.getTextField("position").setText(position);
  } catch {}

  try {
    form.getTextField("verify").setText(verifyUrl);
  } catch {}

  form.flatten();
  const pdfBytes = await certificate.save();
  res.send(Buffer.from(pdfBytes));
});

