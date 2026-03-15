import {program} from "../config/program"
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { programId } from "../config/programId";

export default async function handle_claim(req: any, res: any) {
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
}
