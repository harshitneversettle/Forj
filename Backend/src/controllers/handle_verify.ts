import { PublicKey } from "@solana/web3.js";
import { programId } from "../config/programId";
import { program } from "../config/program";
import { Make_hash } from "../helpers/making_hashes";
import { BN } from "@coral-xyz/anchor";

export default async function handle_verify(req: any, res: any) {
  try {
    const { issuer, uniqueKey, email } = req.body;
    const issuerPubkey = new PublicKey(issuer!);
    console.log(issuerPubkey);
    //console.log(issuerPubkey.toBase58());
    const [eventPda, bump] = PublicKey.findProgramAddressSync(
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
        corress_idx = index; // index of the student in all student , isse hume is student ke merkle proofs milenge
      }
    });
    //console.log(corress_idx);
    const data = JSON.stringify(student);
    console.log(data);
    let leafHash = Make_hash(data);
    const proof = (merkleProof as [])[corress_idx] as any[]; // yaha use hua hai , jo data match hua uska merkle proof nikalo
    for (const i of proof) {
      const cleanHex = i.toString().startsWith("0x") ? i.slice(2) : i;
      const proofBuffer = Buffer.from(cleanHex, "hex");
      if (leafHash.compare(proofBuffer) < 0) {
        // this is like sorting , we used sort true for keys mismatch prpoblem
        leafHash = Make_hash(Buffer.concat([leafHash, proofBuffer])); // root = hash of all the leaves , yaha bhi same ,
        // root = hash of all the merkle proof
      } else {
        leafHash = Make_hash(Buffer.concat([proofBuffer, leafHash]));
      }
    }
    console.log(
      "Expected root:",
      Buffer.from(eventState.merkleRoot).toString("hex"),
    );
    const verified = leafHash.equals(merkleRoot);
    console.log(verified);
    if (verified) {
      return res.send("valid");
    } else {
      return res.send("invalid");
    }
  } catch (error) {
    console.log("lol");
    return res.send("invalid");
  }
}
