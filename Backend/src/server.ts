import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import upload_route from "./routes/upload_route";
import { programId } from "./config/programId";
import { program } from "./config/program";
import handle_claim from "./controllers/handle_claim";
dotenv.config();
let app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173" , "https://forj.harshityad4v.in"] ,
    credentials: true,
  }),
);

app.use("/api/upload", upload_route);
app.use("/api/claim", handle_claim);

app.post("/api/generate-certificate", async (req, res) => {
 
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
